package advmw

import (
	"net/http"
)

// Middleware type with generic service struct
type AdvMiddleware[S any] func(AdvHandler[S]) AdvHandler[S]

// Handler type with generic service struct and returning an error of the ServerError type
type AdvHandler[S any] func(w http.ResponseWriter, r *http.Request, srv *S) AppError

// Middleware Stack
type AdvStack[S any] struct {
	middlewares []AdvMiddleware[S] // Array of all applied middlewares with the first element being the innermost layer
}

func NewStack[S any]() AdvStack[S] {
	return AdvStack[S]{}
}

// Apply a new middleware with it "surrounding" the previously applied middlewares
func (s *AdvStack[S]) Layer(mw AdvMiddleware[S]) {
	s.middlewares = append(s.middlewares, mw)
}

// Takes a handler of the AdvHandler type, applies the middlewares and returns a http.HandlerFunc
func (s *AdvStack[S]) Wrap(h AdvHandler[S]) http.HandlerFunc {

	return func(w http.ResponseWriter, r *http.Request) {
		current := h
		for _, mw := range s.middlewares {
			current = mw(current)
		}
		current(w, r, nil)
	}
}

// Returns a copy and applies specified middleware at the innermost layer
func (s *AdvStack[S]) WithInner(mw AdvMiddleware[S]) *AdvStack[S] {
	newStack := AdvStack[S]{
		middlewares: s.middlewares,
	}
	newStack.middlewares = append([]AdvMiddleware[S]{mw}, newStack.middlewares...)
	return &newStack
}

// Returns a copy and applies specified middleware at the outermost layer
func (s *AdvStack[S]) WithOuter(mw AdvMiddleware[S]) *AdvStack[S] {
	newStack := AdvStack[S]{
		middlewares: s.middlewares,
	}
	newStack.middlewares = append(newStack.middlewares, mw)
	return &newStack
}
