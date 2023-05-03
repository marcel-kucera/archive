package advmw

import (
	"errors"
	"fmt"
)

// AppError contains the user error message, http status code and the full error chain for logging
type AppError interface {
	// Returns the user facing error message
	UserError() error

	// Returns the entire error chain
	FullError() error

	// Returns the http status corresponding the the error
	Status() int
}

//WARNING: this file was written with snippets. use them or suffer insanity!

//---------------------------------------------

// FormError is an error which occured while processing the form
type FormError struct {
	err error
}

func NewFormError(err error) FormError {
	return FormError{err: err}
}

func (e FormError) UserError() error {
	return errors.New("error processing form")
}

func (e FormError) FullError() error {
	return fmt.Errorf("%s: %w", e.UserError(), e.err)
}

func (e FormError) Status() int {
	return 400
}

//---------------------------------------------

// DbError is an error which occured within the database
type DbError struct {
	err error
}

func NewDbError(err error) DbError {
	return DbError{err: err}
}

func (e DbError) UserError() error {
	return errors.New("database error")
}

func (e DbError) FullError() error {
	return fmt.Errorf("%s: %w", e.UserError(), e.err)
}

func (e DbError) Status() int {
	return 500
}

//---------------------------------------------

// NotFound happens when a requested resource could not be found
type NotFoundError struct {
	err error
	res string
}

func NewNotFoundError(err error, res string) NotFoundError {
	return NotFoundError{err: err, res: res}
}

func (e NotFoundError) UserError() error {
	return fmt.Errorf("%s not found", e.res)
}

func (e NotFoundError) FullError() error {
	return fmt.Errorf("%s: %w", e.UserError(), e.err)
}

func (e NotFoundError) Status() int {
	return 404
}

//---------------------------------------------

type IOError struct {
	err error
}

func NewIOError(err error) IOError {
	return IOError{err: err}
}

func (e IOError) UserError() error {
	return errors.New("server io error")
}

func (e IOError) FullError() error {
	return fmt.Errorf("%s: %w", e.UserError(), e.err)
}

func (e IOError) Status() int {
	return 500
}

//---------------------------------------------

type UnauthorizedError struct {
	err error
}

func NewUnauthorizedError(err error) UnauthorizedError {
	return UnauthorizedError{err: err}
}

func (e UnauthorizedError) UserError() error {
	return errors.New("unauthorized")
}

func (e UnauthorizedError) FullError() error {
	return fmt.Errorf("%s: %w", e.UserError(), e.err)
}

func (e UnauthorizedError) Status() int {
	return 400
}

//---------------------------------------------

type UndefinedError struct {
	err error
}

func NewUndefinedError(err error) UndefinedError {
	return UndefinedError{err: err}
}

func (e UndefinedError) UserError() error {
	return errors.New("undefined error")
}

func (e UndefinedError) FullError() error {
	return fmt.Errorf("%s: %w", e.UserError(), e.err)
}

func (e UndefinedError) Status() int {
	return 500
}

//---------------------------------------------

type CustomError struct {
	err    error
	msg    string
	status int
}

func NewCustomError(msg string, status int, err error) CustomError {
	return CustomError{err: err, msg: msg, status: status}
}

func (e CustomError) UserError() error {
	return errors.New(e.msg)
}

func (e CustomError) FullError() error {
	return fmt.Errorf("%s: %w", e.UserError(), e.err)
}

func (e CustomError) Status() int {
	return e.status
}

//---------------------------------------------

type FullError struct {
	err    string
	status int
}

func NewFullError(err string, status int) FullError {
	return FullError{err: err, status: status}
}

func (e FullError) UserError() error {
	return errors.New(e.err)
}

func (e FullError) FullError() error {
	return e.UserError()
}

func (e FullError) Status() int {
	return e.status
}
