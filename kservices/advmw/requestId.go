package advmw

import (
	"context"
	"net/http"

	"github.com/google/uuid"
)

type requestIdKeyType int

const requestIdKey requestIdKeyType = iota

// RequestId inserts a randomly generated (uuid) request id into the request context and header with the "X-Request-Id" key
func RequestId[S any](next AdvHandler[S]) AdvHandler[S] {
	return func(w http.ResponseWriter, r *http.Request, srv *S) AppError {
		id := uuid.New().String()
		newR := r.Clone(context.WithValue(r.Context(), requestIdKey, id))
		w.Header().Set("X-Request-Id", id)
		return next(w, newR, srv)
	}
}

// Retrieve the inserted request id from the request context. Returns an empty string if request id not present
func GetRequestId(ctx context.Context) string {
	id, ok := ctx.Value(requestIdKey).(string)
	if !ok {
		return ""
	} else {
		return id
	}
}
