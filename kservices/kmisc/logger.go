package kmisc

import (
	"go.uber.org/zap"
)

func NewLogger() (*zap.Logger, error) {
	return zap.NewProduction()
}

func MustNewLogger() *zap.Logger {
	l, err := NewLogger()
	if err != nil {
		panic(err)
	}
	return l
}
