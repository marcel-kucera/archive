package advmw

import (
	"net/http"

	"go.uber.org/zap"
)

// The Logging middleware writes infos about the request to the specified logger.
// Info logged:
//  - remote address
//  - requested url
//  - the response status
//  - amount of bytes written
//  - requestId if present
//  - full error chain if present
func Logger[S any](logger *zap.Logger) AdvMiddleware[S] {
	return func(next AdvHandler[S]) AdvHandler[S] {
		return func(w http.ResponseWriter, r *http.Request, srv *S) AppError {
			ww := &wrapWriter{ResponseWriter: w}
			err := next(ww, r, srv)
			reqId := GetRequestId(r.Context())

			fields := []zap.Field{
				zap.String("host", r.RemoteAddr),
				zap.String("route", r.RequestURI),
				zap.Int("status", ww.Status),
				zap.Int("bytesWritten", ww.Written),
			}
			if reqId != "" {
				fields = append(fields, zap.String("requestid", reqId))
			}
			if err != nil {
				fields = append(fields, zap.Error(err.FullError()))
			}

			defer logger.Sync()
			if err != nil {
				if ww.Status >= 500 {
					logger.Error("server error", fields...)
				} else {
					logger.Warn("error", fields...)
				}
			} else {
				logger.Info("request", fields...)
			}
			return err
		}
	}
}

// A small wrapper around the http.ResponseWriter to count the amount of bytes written
type wrapWriter struct {
	http.ResponseWriter
	Status        int
	Written       int
	headerWritten bool
}

func (w *wrapWriter) Write(data []byte) (int, error) {
	if !w.headerWritten {
		w.Status = 200
	}
	i, err := w.ResponseWriter.Write(data)
	w.Written += i
	return i, err
}

func (w *wrapWriter) WriteHeader(status int) {
	if !w.headerWritten {
		w.Status = status
		w.ResponseWriter.WriteHeader(status)
		w.headerWritten = true
	}
}
