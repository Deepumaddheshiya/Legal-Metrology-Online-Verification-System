"use client";

import React, { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input, Label } from "@/components/ui/input";
import {
  CreditCard,
  Smartphone,
  Banknote,
  CheckCircle2,
  XCircle,
  Shield,
  ArrowLeft,
} from "lucide-react";
import { useMockStore } from "@/lib/mockStore";

export default function PaymentGatewayPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const applicationId = searchParams.get("applicationId") || "APP-MH-2026-0001";
  const paymentReference = searchParams.get("ref") || `PAY-${Date.now().toString(36).toUpperCase()}`;
  const paymentMethod = searchParams.get("method") || "upi";
  const amount = Number(searchParams.get("amount") || "2500");
  const returnUrl = searchParams.get("returnUrl") || "/dashboard/applications";

  const [selectedMethod, setSelectedMethod] = useState(paymentMethod);
  const [isProcessing, setIsProcessing] = useState(false);
  const [status, setStatus] = useState<"pending" | "success" | "failed">("pending");
  const [formData, setFormData] = useState({
    upiId: "trader@upi",
    cardNumber: "4532 8901 2345 6789",
    cardExpiry: "12/28",
    cardCvv: "892",
    cardName: "Aisik Trader",
    netbankingBank: "sbi",
  });

  const methods = [
    { id: "upi", label: "UPI", icon: Smartphone, color: "text-purple-600" },
    { id: "card", label: "Credit/Debit Card", icon: CreditCard, color: "text-blue-600" },
    { id: "netbanking", label: "Net Banking", icon: Banknote, color: "text-green-600" },
    { id: "wallet", label: "Wallet", icon: Shield, color: "text-orange-600" },
  ];

  const handlePayment = (success: boolean) => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      if (success) {
        setStatus("success");
        // Update mock store if matching application exists
        const store = useMockStore.getState();
        const app = store.applications.find((a) => a.id === applicationId || a.applicationNumber === applicationId);
        if (app) {
          store.addAuditLog({
            userName: "Payment Gateway",
            userRole: "public",
            action: "ONLINE_PAYMENT_CONFIRMED",
            entityType: "payment",
            entityId: app.id,
            newValues: { feeAmount: amount, feePaid: true, ref: paymentReference },
          });
        }
      } else {
        setStatus("failed");
      }
    }, 1000);
  };

  const methodForms = {
    upi: (
      <div className="space-y-4">
        <Label className="text-xs">UPI ID (e.g., user@paytm, user@okhdfcbank)</Label>
        <Input
          value={formData.upiId}
          onChange={(e) => setFormData({ ...formData, upiId: e.target.value })}
          placeholder="user@bank"
          className="font-mono text-sm"
          required
        />
        <p className="text-xs text-gray-500">
          You will receive a collect request on your UPI app. Approve to complete payment.
        </p>
      </div>
    ),
    card: (
      <div className="space-y-4">
        <Label className="text-xs">Card Number</Label>
        <Input
          value={formData.cardNumber}
          onChange={(e) => setFormData({ ...formData, cardNumber: e.target.value })}
          placeholder="1234 5678 9012 3456"
          maxLength={19}
          className="font-mono text-sm"
          required
        />
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label className="text-xs">Expiry (MM/YY)</Label>
            <Input
              value={formData.cardExpiry}
              onChange={(e) => setFormData({ ...formData, cardExpiry: e.target.value })}
              placeholder="MM/YY"
              maxLength={5}
              className="font-mono text-sm"
              required
            />
          </div>
          <div>
            <Label className="text-xs">CVV</Label>
            <Input
              type="password"
              value={formData.cardCvv}
              onChange={(e) => setFormData({ ...formData, cardCvv: e.target.value })}
              placeholder="123"
              maxLength={3}
              className="font-mono text-sm"
              required
            />
          </div>
        </div>
        <Label className="text-xs">Name on Card</Label>
        <Input
          value={formData.cardName}
          onChange={(e) => setFormData({ ...formData, cardName: e.target.value })}
          placeholder="John Doe"
          className="text-sm"
          required
        />
      </div>
    ),
    netbanking: (
      <div className="space-y-4">
        <Label className="text-xs">Select Bank</Label>
        <select
          value={formData.netbankingBank}
          onChange={(e) => setFormData({ ...formData, netbankingBank: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]"
          required
        >
          <option value="sbi">State Bank of India</option>
          <option value="hdfc">HDFC Bank</option>
          <option value="icici">ICICI Bank</option>
          <option value="axis">Axis Bank</option>
        </select>
      </div>
    ),
    wallet: (
      <div className="space-y-4">
        <p className="text-sm text-gray-600">
          Select your preferred wallet for instant checkout:
        </p>
        <select
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]"
          required
        >
          <option value="paytm">Paytm Wallet</option>
          <option value="phonepe">PhonePe</option>
          <option value="gpay">Google Pay</option>
          <option value="amazonpay">Amazon Pay</option>
        </select>
      </div>
    ),
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="max-w-md mx-auto flex items-center justify-between">
          <Link href={returnUrl} className="text-gray-500 hover:text-gray-700">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#1E3A8A] text-white flex items-center justify-center font-bold text-sm">
              LM
            </div>
            <span className="font-bold text-[#1E3A8A] text-sm">LMOVS Payment Gateway</span>
          </div>
          <Shield className="w-5 h-5 text-emerald-600" />
        </div>
      </header>

      <main className="flex-1 max-w-md mx-auto w-full p-4 space-y-4">
        {/* Payment Summary */}
        <Card className="bg-white border-[#1E3A8A] shadow-md">
          <CardHeader className="bg-[#1E3A8A] text-white rounded-t-lg">
            <CardTitle className="text-white font-bold">Statutory Fee Summary</CardTitle>
          </CardHeader>
          <CardContent className="p-4 space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Application Number</span>
              <span className="font-mono font-bold text-[#1E3A8A]">{applicationId}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Payment Reference</span>
              <span className="font-mono font-bold text-[#1E3A8A] text-xs">{paymentReference}</span>
            </div>
            <div className="flex justify-between text-lg pt-2 border-t border-gray-100">
              <span className="font-bold text-gray-900">Amount Payable</span>
              <span className="font-black text-[#1E3A8A] text-xl">₹{amount.toLocaleString()}</span>
            </div>
          </CardContent>
        </Card>

        {status === "pending" && (
          <>
            {/* Payment Method Selection */}
            <Card className="bg-white">
              <CardContent className="p-4">
                <h3 className="text-sm font-bold text-gray-900 mb-3">Select Payment Method</h3>
                <div className="grid grid-cols-2 gap-3">
                  {methods.map((method) => (
                    <button
                      key={method.id}
                      onClick={() => setSelectedMethod(method.id)}
                      className={`p-3 rounded-xl border-2 flex flex-col items-center gap-2 transition-all ${
                        selectedMethod === method.id
                          ? "border-[#1E3A8A] bg-blue-50 shadow-md"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <method.icon className={`w-6 h-6 ${method.color}`} />
                      <span className="text-xs font-bold text-gray-700">{method.label}</span>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Payment Form */}
            <Card className="bg-white">
              <CardHeader className="p-4 border-b border-gray-100">
                <div className="flex items-center gap-2">
                  {(() => {
                    const m = methods.find((m) => m.id === selectedMethod);
                    return m?.icon ? <m.icon className={`w-5 h-5 ${m.color}`} /> : null;
                  })()}
                  <CardTitle className="text-sm font-bold text-gray-900">
                    {methods.find((m) => m.id === selectedMethod)?.label} Payment
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent className="p-4">
                {methodForms[selectedMethod as keyof typeof methodForms]}
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-3">
              <Button
                variant="secondary"
                onClick={() => router.back()}
                className="h-11 font-bold"
                disabled={isProcessing}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={() => handlePayment(true)}
                isLoading={isProcessing}
                className="h-11 font-bold shadow-md"
                disabled={isProcessing}
                leftIcon={<CreditCard className="w-4 h-4" />}
              >
                Pay ₹{amount.toLocaleString()}
              </Button>
            </div>

            {/* Demo Helper */}
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-800 flex items-center gap-2">
              <span className="font-bold">Demo Mode:</span>
              <span>Use the test buttons below to simulate payment success/failure instantly.</span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Button
                variant="outline"
                onClick={() => handlePayment(true)}
                isLoading={isProcessing}
                className="h-11 font-bold border-emerald-500 text-emerald-700 hover:bg-emerald-50"
                disabled={isProcessing}
                leftIcon={<CheckCircle2 className="w-4 h-4" />}
              >
                Simulate Success
              </Button>
              <Button
                variant="outline"
                onClick={() => handlePayment(false)}
                isLoading={isProcessing}
                className="h-11 font-bold border-red-500 text-red-700 hover:bg-red-50"
                disabled={isProcessing}
                leftIcon={<XCircle className="w-4 h-4" />}
              >
                Simulate Failure
              </Button>
            </div>
          </>
        )}

        {status === "success" && (
          <Card className="bg-white border-emerald-200">
            <CardContent className="p-6 text-center">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-emerald-900 mb-2">Payment Successful!</h3>
              <p className="text-sm text-emerald-700 mb-4">
                Your statutory verification fee of <strong>₹{amount.toLocaleString()}</strong> has been locked into the treasury.
              </p>
              <p className="text-xs text-gray-500 mb-4">
                Reference: <span className="font-mono">{paymentReference}</span>
              </p>
              <Button
                variant="primary"
                onClick={() => router.push(returnUrl)}
                className="w-full h-11 font-bold"
              >
                Return to Applications Dashboard
              </Button>
            </CardContent>
          </Card>
        )}

        {status === "failed" && (
          <Card className="bg-white border-red-200">
            <CardContent className="p-6 text-center">
              <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <XCircle className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-red-900 mb-2">Payment Failed</h3>
              <p className="text-sm text-red-700 mb-4">
                The payment could not be processed. Please try again.
              </p>
              <div className="flex gap-3 justify-center">
                <Button variant="outline" onClick={() => setStatus("pending")} className="h-11 font-bold">
                  Try Again
                </Button>
                <Button variant="secondary" onClick={() => router.push(returnUrl)} className="h-11 font-bold">
                  Go Back
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 px-4 py-3">
        <p className="text-center text-xs text-gray-500 max-w-md mx-auto">
          Legal Metrology Online Verification System (LMOVS) &copy; 2026 Ministry of Consumer Affairs
        </p>
      </footer>
    </div>
  );
}