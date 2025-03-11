// backend/internal/services/payments/mpesa.go
package payments

import "os"

type MPesaService struct {
	baseURL        string
	consumerKey    string
	consumerSecret string
	passKey        string
	shortCode      string
	callbackUrl    string
}

func NewMPesaService() *MPesaService {
	return &MPesaService{
		baseURL:        os.Getenv("MPESA_BASE_URL"),
		consumerKey:    os.Getenv("MPESA_CONSUMER_KEY"),
		consumerSecret: os.Getenv("MPESA_CONSUMER_SECRET"),
		passKey:        os.Getenv("MPESA_PASS_KEY"),
		shortCode:      os.Getenv("MPESA_SHORT_CODE"),
		callbackUrl:    os.Getenv("MPESA_CALLBACK_URL"),
	}
}

type STKPushRequest struct {
	BusinessShortCode string
	Password          string
	Timestamp         string
	TransactionType   string
	Amount            string
	PartyA            string
	PartyB            string
	PhoneNumber       string
	callBackUrl       string
	AccountReference  string
	TransactionDesc   string
}

// TODO: implement actual stk push