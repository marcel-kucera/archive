package advmw

import (
	"fmt"
	"net/http"
)

// The ErrorHandler middleware automatically catches the returned ServerError
// and writes the error message and status into the http response
func ErrorHandler[S any](next AdvHandler[S]) AdvHandler[S] {
	return func(w http.ResponseWriter, r *http.Request, s *S) AppError {
		defer func() {
			if recover() != nil {
				w.WriteHeader(500)
				fmt.Fprintf(w, "internal server error")
			}
		}()

		err := next(w, r, s)
		if err != nil {
			w.WriteHeader(err.Status())
			fmt.Fprintf(w, "%s", err.UserError())
		}
		return err
	}
}
