// ackend.
package errors

type APIError struct {
    Code    int    `json:"code"`
    Message string `json:"message"`
    Details string `json:"details,omitempty"`
}

func NewAPIError(code int, message string) *APIError {
    return &APIError{
        Code:    code,
        Message: message,
    }
}
