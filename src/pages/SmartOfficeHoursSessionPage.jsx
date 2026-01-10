import { useEffect, useMemo, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import QRCode from "react-qr-code";

import { useAuth } from "../contexts/AuthContext";
import { smartOfficeHoursApi } from "../api/smartOfficeHoursApi";
import {
  startSmartOfficeHoursConnection,
  joinOfficeHourAsProvider,
  joinOfficeHourAsStudent,
  onProviderViewUpdated,
  offProviderViewUpdated,
  onStudentViewUpdated,
  offStudentViewUpdated,
} from "../api/smartOfficeHoursSignalrClient";

const QrScanPanel = ({ onDetected }) => {
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const intervalRef = useRef(null);

  const [isOpen, setIsOpen] = useState(false);
  const [supported, setSupported] = useState(false);

  useEffect(() => {
    setSupported(typeof window !== "undefined" && "BarcodeDetector" in window);
  }, []);

  const stop = async () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  };

  useEffect(() => {
    return () => {
      stop();
    };
  }, []);

  const start = async () => {
    if (!supported) {
      toast.error("QR scanning not supported in this browser. Paste token instead.");
      return;
    }

    try {
      await stop();
      const detector = new window.BarcodeDetector({ formats: ["qr_code"] });
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
      });
      streamRef.current = stream;

      const video = videoRef.current;
      if (!video) return;
      video.srcObject = stream;
      await video.play();

      intervalRef.current = setInterval(async () => {
        try {
          if (!videoRef.current) return;
          const barcodes = await detector.detect(videoRef.current);
          if (barcodes && barcodes.length > 0) {
            const raw = barcodes[0]?.rawValue;
            if (raw) {
              setIsOpen(false);
              await stop();
              onDetected(raw);
            }
          }
        } catch {
          // ignore transient detection failures
        }
      }, 450);

      setIsOpen(true);
    } catch (e) {
      console.error(e);
      toast.error("Could not access camera");
      await stop();
    }
  };

  if (!supported) {
    return (
      <div className="text-sm text-gray-600 dark:text-gray-300">
        Camera QR scan not supported here. Use the token input below.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <button
        type="button"
        className="px-3 py-2 rounded bg-gray-900 text-white dark:bg-gray-100 dark:text-gray-900"
        onClick={() => (isOpen ? (setIsOpen(false), stop()) : start())}
      >
        {isOpen ? "Stop camera scan" : "Scan QR with camera"}
      </button>

      {isOpen ? (
        <div className="rounded border border-gray-200 dark:border-gray-700 p-3">
          <video ref={videoRef} className="w-full max-w-md rounded" muted playsInline />
          <div className="text-xs text-gray-500 mt-2">Point camera at the QR.</div>
        </div>
      ) : null}
    </div>
  );
};

const SmartOfficeHoursSessionPage = () => {
  const { officeHourId } = useParams();
  const navigate = useNavigate();
  const { isStudent } = useAuth();

  const numericOfficeHourId = useMemo(() => Number(officeHourId), [officeHourId]);

  const [studentView, setStudentView] = useState(null);
  const [providerView, setProviderView] = useState(null);
  const [loading, setLoading] = useState(true);

  const [purpose, setPurpose] = useState("");
  const [tokenInput, setTokenInput] = useState("");

  useEffect(() => {
    const handleStudent = (payload) => {
      setStudentView(payload);
    };

    const handleProvider = (payload) => {
      setProviderView(payload);
    };

    onStudentViewUpdated(handleStudent);
    onProviderViewUpdated(handleProvider);

    return () => {
      offStudentViewUpdated(handleStudent);
      offProviderViewUpdated(handleProvider);
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    const boot = async () => {
      if (!numericOfficeHourId || Number.isNaN(numericOfficeHourId)) {
        toast.error("Invalid office hour id");
        navigate("/office-hours");
        return;
      }

      try {
        setLoading(true);
        await startSmartOfficeHoursConnection();

        if (isStudent()) {
          await joinOfficeHourAsStudent(numericOfficeHourId);
        } else {
          await joinOfficeHourAsProvider(numericOfficeHourId);
        }

        if (!cancelled) setLoading(false);
      } catch (e) {
        console.error(e);
        toast.error("Could not connect to office hours hub");
        if (!cancelled) setLoading(false);
      }
    };

    boot();
    return () => {
      cancelled = true;
    };
  }, [numericOfficeHourId, isStudent, navigate]);

  const handleJoinQueue = async () => {
    try {
      await smartOfficeHoursApi.joinQueue(numericOfficeHourId, { purpose });
      toast.success("Joined queue");
    } catch {
      // axios interceptor shows errors
    }
  };

  const handleScan = async (token) => {
    const t = String(token || tokenInput || "").trim();
    if (!t) {
      toast.error("Token is required");
      return;
    }

    try {
      await smartOfficeHoursApi.scan(t);
      toast.success("Checked in");
      setTokenInput("");
    } catch {
      // interceptor
    }
  };

  const handleCallNext = async () => {
    try {
      await smartOfficeHoursApi.callNext(numericOfficeHourId);
      toast.success("Called next student");
    } catch {
      // interceptor
    }
  };

  const handleComplete = async () => {
    try {
      await smartOfficeHoursApi.completeCurrent(numericOfficeHourId);
      toast.success("Marked done");
    } catch {
      // interceptor
    }
  };

  const handleNoShow = async () => {
    try {
      await smartOfficeHoursApi.noShowCurrent(numericOfficeHourId);
      toast.success("Marked no-show");
    } catch {
      // interceptor
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600" />
      </div>
    );
  }

  if (isStudent()) {
    const status = studentView?.status;

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Smart Office Hours</h1>
            <p className="text-gray-600 dark:text-gray-400">Office hour #{numericOfficeHourId}</p>
          </div>
          <button
            type="button"
            className="px-3 py-2 rounded border border-gray-200 dark:border-gray-700"
            onClick={() => navigate("/office-hours")}
          >
            Back
          </button>
        </div>

        <div className="rounded-lg border border-gray-200 dark:border-gray-700 p-4 space-y-3">
          <div className="text-sm text-gray-600 dark:text-gray-300">
            Status: <span className="font-medium text-gray-900 dark:text-white">{status || "Not in queue"}</span>
          </div>
          {studentView?.position ? (
            <div className="text-sm text-gray-600 dark:text-gray-300">
              Position: <span className="font-medium text-gray-900 dark:text-white">{studentView.position}</span>
              {typeof studentView.estimatedWaitMinutes === "number" ? (
                <span className="ml-2">(ETA ~ {studentView.estimatedWaitMinutes} min)</span>
              ) : null}
            </div>
          ) : null}

          {!studentView?.queueEntryId ? (
            <div className="space-y-3">
              <div>
                <label className="block text-sm text-gray-600 dark:text-gray-300">Purpose (optional)</label>
                <input
                  value={purpose}
                  onChange={(e) => setPurpose(e.target.value)}
                  className="mt-1 w-full max-w-md px-3 py-2 rounded border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900"
                  placeholder="e.g., course question"
                />
              </div>
              <button
                type="button"
                className="px-4 py-2 rounded bg-primary-600 text-white hover:bg-primary-700"
                onClick={handleJoinQueue}
              >
                Join queue
              </button>
            </div>
          ) : null}

          {status === "Ready" ? (
            <div className="space-y-4 pt-2">
              <div className="text-sm text-gray-700 dark:text-gray-200">
                You’re up next. Scan the provider’s QR to check in.
              </div>

              <QrScanPanel onDetected={handleScan} />

              <div className="space-y-2">
                <label className="block text-sm text-gray-600 dark:text-gray-300">Or paste token</label>
                <div className="flex gap-2">
                  <input
                    value={tokenInput}
                    onChange={(e) => setTokenInput(e.target.value)}
                    className="flex-1 px-3 py-2 rounded border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900"
                    placeholder="Paste token string"
                  />
                  <button
                    type="button"
                    className="px-4 py-2 rounded bg-gray-900 text-white dark:bg-gray-100 dark:text-gray-900"
                    onClick={() => handleScan()}
                  >
                    Scan
                  </button>
                </div>
              </div>

              {studentView?.readyExpiresAtUtc ? (
                <div className="text-xs text-gray-500">
                  Must check in before: {new Date(studentView.readyExpiresAtUtc).toLocaleString()}
                </div>
              ) : null}
            </div>
          ) : null}

          {status === "InProgress" ? (
            <div className="text-sm text-green-700 dark:text-green-400">Checked in. Please proceed.</div>
          ) : null}
          {status === "Done" ? (
            <div className="text-sm text-blue-700 dark:text-blue-400">Completed. Thanks!</div>
          ) : null}
          {status === "NoShow" ? (
            <div className="text-sm text-red-700 dark:text-red-400">Marked as no-show.</div>
          ) : null}
        </div>
      </div>
    );
  }

  // Provider view
  const current = providerView?.currentReadyOrInProgress;
  const showQr = current?.status === "Ready" && providerView?.currentQrToken;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Smart Office Hours (Provider)</h1>
          <p className="text-gray-600 dark:text-gray-400">Office hour #{numericOfficeHourId}</p>
        </div>
        <button
          type="button"
          className="px-3 py-2 rounded border border-gray-200 dark:border-gray-700"
          onClick={() => navigate("/office-hours")}
        >
          Back
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-lg border border-gray-200 dark:border-gray-700 p-4 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Queue</h2>
            <button
              type="button"
              className="px-3 py-2 rounded bg-primary-600 text-white hover:bg-primary-700"
              onClick={handleCallNext}
            >
              Call next
            </button>
          </div>

          {Array.isArray(providerView?.queue) && providerView.queue.length > 0 ? (
            <div className="space-y-2">
              {providerView.queue.map((e) => (
                <div
                  key={e.queueEntryId}
                  className="flex items-center justify-between rounded border border-gray-100 dark:border-gray-800 p-3"
                >
                  <div>
                    <div className="font-medium text-gray-900 dark:text-white">
                      {e.position ? `#${e.position} ` : ""}{e.studentFullName || e.studentUserId}
                    </div>
                    <div className="text-xs text-gray-500">{e.status}</div>
                  </div>
                  <div className="text-xs text-gray-500">ETA {e.estimatedWaitMinutes ?? "-"}m</div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-sm text-gray-600 dark:text-gray-300">No one in queue yet.</div>
          )}
        </div>

        <div className="rounded-lg border border-gray-200 dark:border-gray-700 p-4 space-y-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Current</h2>

          {!current ? (
            <div className="text-sm text-gray-600 dark:text-gray-300">No active student.</div>
          ) : (
            <div className="space-y-3">
              <div className="text-sm text-gray-700 dark:text-gray-200">
                <span className="font-medium">{current.studentFullName || current.studentUserId}</span>
                <span className="ml-2 text-xs text-gray-500">({current.status})</span>
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  className="px-3 py-2 rounded bg-gray-900 text-white dark:bg-gray-100 dark:text-gray-900"
                  onClick={handleComplete}
                  disabled={current.status !== "InProgress"}
                >
                  Confirm completion
                </button>
                <button
                  type="button"
                  className="px-3 py-2 rounded border border-red-200 text-red-700 dark:border-red-800 dark:text-red-300"
                  onClick={handleNoShow}
                  disabled={current.status !== "Ready"}
                >
                  No-show
                </button>
              </div>

              {showQr ? (
                <div className="space-y-2">
                  <div className="text-sm text-gray-700 dark:text-gray-200">Show this QR to the student:</div>
                  <div className="bg-white p-3 rounded inline-block">
                    <QRCode value={providerView.currentQrToken} size={180} />
                  </div>
                  {providerView?.currentQrExpiresAtUtc ? (
                    <div className="text-xs text-gray-500">
                      Expires: {new Date(providerView.currentQrExpiresAtUtc).toLocaleTimeString()}
                    </div>
                  ) : null}
                </div>
              ) : null}

              {current.status === "Ready" && !providerView?.currentQrToken ? (
                <div className="text-xs text-gray-500">Waiting for QR token…</div>
              ) : null}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SmartOfficeHoursSessionPage;
