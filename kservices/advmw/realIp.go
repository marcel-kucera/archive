package advmw

import (
	"net/http"
	"strings"
)

const RealIpHeaderKey = "X-Real-Ip"

// RealIp
func RealIp[S any](next AdvHandler[S]) AdvHandler[S] {
	return func(w http.ResponseWriter, r *http.Request, srv *S) AppError {
		realIp := r.RemoteAddr

		ipFromHeader := r.Header.Get(RealIpHeaderKey)
		if ipFromHeader != "" {
			realIp = ipFromHeader
		}
		r.RemoteAddr = removePort(realIp)
		return next(w, r, srv)
	}
}

// removes the port in a remote address (trims everything after the last :)
func removePort(ip string) string {
	s := strings.Split(ip, ":")
	new := make([]string, 0)
	for i, el := range s {
		if i < len(s)-1 {
			new = append(new, el)
		}
	}
	return strings.Join(new, ":")
}
