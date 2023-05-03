package advmw

import "net/http"

// Passes the given Service struct down the middleware stack and then to the handler
func InjectService[S any](inject *S) AdvMiddleware[S] {
	return func(next AdvHandler[S]) AdvHandler[S] {
		return func(w http.ResponseWriter, r *http.Request, srv *S) AppError {
			return next(w, r, inject)
		}
	}
}
