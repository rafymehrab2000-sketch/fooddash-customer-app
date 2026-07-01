import React, { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTheme } from '../context/ThemeContext'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import API from '../api'

function PaymentModal({ t, total, onClose, onPay, loading }) {
  const [cardNumber, setCardNumber] = useState('')
  const [expiry, setExpiry] = useState('')
  const [cvv, setCvv] = useState('')
  const [focused, setFocused] = useState(null)

  const handleCardNumber = (v) => {
    const d = v.replace(/\D/g, '').slice(0, 16)
    setCardNumber(d.replace(/(.{4})/g, '$1 ').trim())
  }
  const handleExpiry = (v) => {
    const d = v.replace(/\D/g, '')
    setExpiry(d.length <= 2 ? d : d.slice(0, 2) + '/' + d.slice(2, 4))
  }

  const isCardValid = cardNumber.replace(/\s/g, '').length === 16
  const isExpiryValid = /^\d{2}\/\d{2}$/.test(expiry)
  const isCvvValid = cvv.length >= 3
  const canPay = isCardValid && isExpiryValid && isCvvValid

  const inputWrap = (field) => ({
    display: 'flex', alignItems: 'center',
    backgroundColor: t.inputBg, borderRadius: 14,
    border: `1px solid ${focused === field ? t.accent : t.inputBorder}`,
    paddingLeft: 14, paddingRight: 14,
    boxShadow: focused === field ? `0 0 0 3px ${t.accent}33` : 'none',
    transition: 'all 0.2s',
  })

  const inputStyle = {
    flex: 1, padding: '14px 0', fontSize: 15,
    color: t.text, background: 'none', border: 'none', outline: 'none', letterSpacing: 0.5,
  }

  return (
    <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', zIndex: 200, padding: '0 0 0' }}>
      <div style={{
        backgroundColor: t.card, borderTopLeftRadius: 28, borderTopRightRadius: 28,
        padding: '24px 28px 40px', width: '100%', maxWidth: 600,
        boxShadow: '0 -8px 32px rgba(0,0,0,0.2)',
      }}>
        <div style={{ width: 40, height: 4, borderRadius: 2, backgroundColor: t.border, margin: '0 auto 24px', cursor: 'pointer' }} onClick={onClose} />
        <div style={{ fontSize: 22, fontWeight: 800, color: t.text, marginBottom: 4 }}>Pay with Card</div>
        <div style={{ fontSize: 13, color: t.textMuted, marginBottom: 24 }}>Secure payment · Powered by Stripe</div>

        <div style={{ fontSize: 12, fontWeight: 700, color: t.textSub, marginBottom: 8, letterSpacing: 0.5 }}>CARD NUMBER</div>
        <div style={{ ...inputWrap('card'), marginBottom: 16 }}>
          <span style={{ fontSize: 16, marginRight: 10 }}>💳</span>
          <input
            style={inputStyle}
            placeholder="4242 4242 4242 4242"
            value={cardNumber}
            onChange={e => handleCardNumber(e.target.value)}
            onFocus={() => setFocused('card')}
            onBlur={() => setFocused(null)}
            maxLength={19}
          />
        </div>

        <div style={{ display: 'flex', gap: 12, marginBottom: 8 }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: t.textSub, marginBottom: 8, letterSpacing: 0.5 }}>EXPIRY</div>
            <div style={{ ...inputWrap('expiry'), marginBottom: 0 }}>
              <input
                style={inputStyle}
                placeholder="MM/YY"
                value={expiry}
                onChange={e => handleExpiry(e.target.value)}
                onFocus={() => setFocused('expiry')}
                onBlur={() => setFocused(null)}
                maxLength={5}
              />
            </div>
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: t.textSub, marginBottom: 8, letterSpacing: 0.5 }}>CVV</div>
            <div style={{ ...inputWrap('cvv'), marginBottom: 0 }}>
              <input
                style={inputStyle}
                placeholder="123"
                value={cvv}
                onChange={e => setCvv(e.target.value.replace(/\D/g, '').slice(0, 4))}
                onFocus={() => setFocused('cvv')}
                onBlur={() => setFocused(null)}
                type="password"
                maxLength={4}
              />
            </div>
          </div>
        </div>

        <div style={{ fontSize: 11, color: t.textDim, textAlign: 'center', margin: '16px 0 24px' }}>
          Test: 4242 4242 4242 4242 · 12/26 · 123
        </div>

        <button
          onClick={() => canPay && onPay(cardNumber, expiry, cvv)}
          disabled={!canPay || loading}
          style={{
            width: '100%', backgroundColor: canPay ? t.accent : t.inputBg,
            color: canPay ? t.accentText : t.textMuted,
            border: 'none', borderRadius: 16, padding: '18px',
            fontSize: 17, fontWeight: 800, cursor: canPay && !loading ? 'pointer' : 'not-allowed',
            boxShadow: canPay ? `0 4px 14px ${t.accent}66` : 'none',
            marginBottom: 12, transition: 'all 0.2s',
          }}
        >
          {loading ? 'Processing...' : canPay ? `Pay €${total.toFixed(2)}` : 'Enter card details'}
        </button>

        <button onClick={onClose} disabled={loading} style={{ width: '100%', padding: '12px', fontSize: 15, color: t.textMuted, fontWeight: 600, cursor: 'pointer', background: 'none', border: 'none' }}>
          Cancel
        </button>
      </div>
    </div>
  )
}

export default function CartPage() {
  const { theme: t } = useTheme()
  const { items: cart, restaurant, clearCart } = useCart()
  const { user } = useAuth()
  const navigate = useNavigate()

  const addressInputRef = useRef(null)
  const autocompleteRef = useRef(null)

  const [address, setAddress] = useState('')
  const [entrance, setEntrance] = useState('')
  const [floor, setFloor] = useState('')
  const [apartment, setApartment] = useState('')
  const [additionalInfo, setAdditionalInfo] = useState('')
  const [phone, setPhone] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPayment, setShowPayment] = useState(false)
  const [focused, setFocused] = useState(null)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    const initAutocomplete = () => {
      if (!addressInputRef.current || !window.google?.maps?.places) return
      const ac = new window.google.maps.places.Autocomplete(addressInputRef.current, {
        types: ['address'],
      })
      autocompleteRef.current = ac
      ac.addListener('place_changed', () => {
        const place = ac.getPlace()
        setAddress(place.formatted_address || addressInputRef.current.value)
      })
    }

    if (window.google?.maps?.places) {
      initAutocomplete()
      return
    }

    const scriptId = 'google-maps-places-script'
    const existing = document.getElementById(scriptId)
    if (!existing) {
      const script = document.createElement('script')
      script.id = scriptId
      script.src = `https://maps.googleapis.com/maps/api/js?key=${import.meta.env.VITE_GOOGLE_MAPS_KEY}&libraries=places`
      script.async = true
      script.onload = initAutocomplete
      document.head.appendChild(script)
    } else {
      existing.addEventListener('load', initAutocomplete)
    }

    return () => {
      if (autocompleteRef.current && window.google?.maps?.event) {
        window.google.maps.event.clearInstanceListeners(autocompleteRef.current)
      }
    }
  }, [])

  const subtotal = cart.reduce((s, i) => s + i.price * i.quantity, 0)
  const deliveryFee = 3.50
  const serviceFee = 0.80
  const total = subtotal + deliveryFee + serviceFee

  const formatFinnishPhone = (raw) => {
    let digits = raw.replace(/\D/g, '')
    if (digits.startsWith('358')) digits = digits.slice(3)
    if (digits.startsWith('0')) digits = digits.slice(1)
    digits = digits.slice(0, 9)
    if (!digits) return ''
    let out = digits.slice(0, 2)
    if (digits.length > 2) out += ' ' + digits.slice(2, 5)
    if (digits.length > 5) out += ' ' + digits.slice(5, 9)
    return out
  }

  const isPhoneValid = /^\d{2} \d{3} \d{4}$/.test(phone)
  const fullPhone = phone ? `+358 ${phone}` : ''
  const isAddressValid = address.trim().length >= 5
  const isEntranceValid = entrance.trim().length > 0
  const isFloorValid = floor.trim().length > 0
  const isApartmentValid = apartment.trim().length > 0
  const canOrder = isPhoneValid && isAddressValid && isEntranceValid && isFloorValid && isApartmentValid

  const clearAddressFields = () => {
    setAddress('')
    setEntrance('')
    setFloor('')
    setApartment('')
    setAdditionalInfo('')
  }

  const openPayment = () => {
    if (!isPhoneValid || !isAddressValid || !isEntranceValid || !isFloorValid || !isApartmentValid) {
      alert('Please fill in all required delivery details')
      return
    }
    setShowPayment(true)
  }

  const handlePayment = async () => {
    setLoading(true)
    try {
      await API.post('/payment/create-payment-intent', { amount: Math.round(total * 100) })
      await API.post('/orders', {
        restaurantId: restaurant.id,
        customerName: user?.name ?? '',
        customerPhone: fullPhone,
        customerAddress: address,
        entrance,
        floor,
        apartment,
        additionalInfo,
        subtotal, deliveryFee, serviceFee, total,
        items: cart.map(item => ({ menuItemId: item.id, quantity: item.quantity, price: item.price })),
      })
      setShowPayment(false)
      setSuccess(true)
      setTimeout(() => {
        clearCart()
        navigate('/orders')
      }, 2500)
    } catch {
      alert('Payment failed. Please try again.')
    }
    setLoading(false)
  }

  const inputWrap = (field) => ({
    display: 'flex', alignItems: 'center',
    backgroundColor: t.inputBg, borderRadius: 14,
    border: `1px solid ${focused === field ? t.accent : t.inputBorder}`,
    paddingLeft: 14, paddingRight: 14, marginBottom: 12,
    boxShadow: focused === field ? `0 0 0 3px ${t.accent}33` : 'none',
    transition: 'all 0.2s',
  })

  const inputStyle = {
    flex: 1, padding: '14px 0', fontSize: 15,
    color: t.text, background: 'none', border: 'none', outline: 'none',
  }

  if (success) return (
    <div style={{ minHeight: '100vh', backgroundColor: t.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ textAlign: 'center', padding: 40 }}>
        <div style={{ fontSize: 72, marginBottom: 20 }}>🎉</div>
        <div style={{ fontSize: 28, fontWeight: 800, color: t.text, marginBottom: 8 }}>Order Placed!</div>
        <div style={{ fontSize: 16, color: t.textMuted }}>Payment successful! Redirecting to your orders...</div>
      </div>
    </div>
  )

  if (cart.length === 0) return (
    <div style={{ minHeight: '100vh', backgroundColor: t.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ textAlign: 'center', padding: 40 }}>
        <div style={{ fontSize: 64, marginBottom: 20 }}>🛒</div>
        <div style={{ fontSize: 24, fontWeight: 700, color: t.text, marginBottom: 8 }}>Your cart is empty</div>
        <div style={{ fontSize: 15, color: t.textMuted, marginBottom: 24 }}>Add some delicious food!</div>
        <button onClick={() => navigate('/')} style={{ backgroundColor: t.accent, color: t.accentText, border: 'none', padding: '14px 28px', borderRadius: 20, fontSize: 16, fontWeight: 800, cursor: 'pointer' }}>
          Browse Restaurants
        </button>
      </div>
    </div>
  )

  return (
    <div style={{ backgroundColor: t.bg, minHeight: '100vh' }}>
      <div style={{ maxWidth: 800, margin: '0 auto', padding: '24px 20px 60px' }}>

        {/* Header */}
        <div style={{ marginBottom: 24 }}>
          <button onClick={() => navigate(-1)} style={{ color: t.textMuted, fontSize: 15, cursor: 'pointer', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none' }}>
            ← Back
          </button>
          <div style={{ fontSize: 28, fontWeight: 800, color: t.text, marginBottom: 8 }}>Your Cart</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 16 }}>🍽️</span>
            <span style={{ fontSize: 14, color: t.accent, fontWeight: 600 }}>{restaurant?.name}</span>
          </div>
        </div>

        {/* Order Items */}
        <div style={{ backgroundColor: t.card, borderRadius: 20, padding: 20, marginBottom: 16, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
          <div style={{ fontSize: 16, fontWeight: 700, color: t.text, marginBottom: 16 }}>Order Items</div>
          {cart.map((item, idx) => (
            <div key={item.id} style={{
              display: 'flex', alignItems: 'center', gap: 12, paddingBottom: 12, paddingTop: idx === 0 ? 0 : 12,
              borderTop: idx === 0 ? 'none' : `1px solid ${t.border}`,
            }}>
              <div style={{ backgroundColor: t.accent, width: 26, height: 26, borderRadius: 13, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <span style={{ fontSize: 12, fontWeight: 800, color: t.accentText }}>{item.quantity}</span>
              </div>
              <span style={{ flex: 1, fontSize: 14, color: t.text, fontWeight: 500 }}>{item.name}</span>
              <span style={{ fontSize: 14, fontWeight: 700, color: t.accent }}>€{(item.price * item.quantity).toFixed(2)}</span>
            </div>
          ))}
        </div>

        {/* Delivery Details */}
        <div style={{ backgroundColor: t.card, borderRadius: 20, padding: 20, marginBottom: 16, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
          <div style={{ fontSize: 16, fontWeight: 700, color: t.text, marginBottom: 16 }}>Delivery Details</div>

          <div style={inputWrap('phone')}>
            <span style={{ fontSize: 16, marginRight: 10 }}>📞</span>
            <span style={{ fontSize: 15, fontWeight: 600, color: t.textMuted, marginRight: 6, flexShrink: 0 }}>+358</span>
            <input
              style={inputStyle}
              type="tel"
              placeholder="XX XXX XXXX"
              value={phone}
              onChange={e => setPhone(formatFinnishPhone(e.target.value))}
              onFocus={() => setFocused('phone')}
              onBlur={() => setFocused(null)}
            />
            {phone && <span style={{ fontSize: 16, color: isPhoneValid ? t.good : t.bad }}>{isPhoneValid ? '✓' : '✗'}</span>}
          </div>

          {/* Address — Google Places Autocomplete attaches to this input */}
          <div style={inputWrap('address')}>
            <span style={{ fontSize: 16, marginRight: 10 }}>📍</span>
            <input
              ref={addressInputRef}
              style={inputStyle}
              placeholder="Search delivery address"
              onChange={e => { if (!e.target.value) clearAddressFields() }}
              onFocus={() => setFocused('address')}
              onBlur={() => setFocused(null)}
            />
            {isAddressValid && <span style={{ fontSize: 16, color: t.good }}>✓</span>}
          </div>
          {isAddressValid && (
            <div style={{ fontSize: 12, fontWeight: 600, color: t.good, paddingLeft: 4, marginTop: -4, marginBottom: 14 }}>
              ✓ Address selected
            </div>
          )}

          {/* Detail fields — appear after a place is selected */}
          {isAddressValid && (
            <>
              <div style={{ fontSize: 12, fontWeight: 700, color: t.textSub, marginBottom: 12, letterSpacing: 0.3 }}>
                Complete your delivery address
              </div>

              <div style={inputWrap('entrance')}>
                <span style={{ fontSize: 16, marginRight: 10 }}>🚪</span>
                <input
                  style={inputStyle}
                  placeholder="Entrance *"
                  value={entrance}
                  onChange={e => setEntrance(e.target.value)}
                  onFocus={() => setFocused('entrance')}
                  onBlur={() => setFocused(null)}
                />
                {entrance && <span style={{ fontSize: 16, color: isEntranceValid ? t.good : t.bad }}>{isEntranceValid ? '✓' : '✗'}</span>}
              </div>

              <div style={inputWrap('floor')}>
                <span style={{ fontSize: 16, marginRight: 10 }}>🏢</span>
                <input
                  style={inputStyle}
                  placeholder="Floor *"
                  inputMode="numeric"
                  value={floor}
                  onChange={e => setFloor(e.target.value)}
                  onFocus={() => setFocused('floor')}
                  onBlur={() => setFocused(null)}
                />
                {floor && <span style={{ fontSize: 16, color: isFloorValid ? t.good : t.bad }}>{isFloorValid ? '✓' : '✗'}</span>}
              </div>

              <div style={inputWrap('apartment')}>
                <span style={{ fontSize: 16, marginRight: 10 }}>🏠</span>
                <input
                  style={inputStyle}
                  placeholder="Apartment number *"
                  value={apartment}
                  onChange={e => setApartment(e.target.value)}
                  onFocus={() => setFocused('apartment')}
                  onBlur={() => setFocused(null)}
                />
                {apartment && <span style={{ fontSize: 16, color: isApartmentValid ? t.good : t.bad }}>{isApartmentValid ? '✓' : '✗'}</span>}
              </div>

              <div style={{ ...inputWrap('additionalInfo'), marginBottom: 0 }}>
                <span style={{ fontSize: 16, marginRight: 10 }}>📝</span>
                <input
                  style={inputStyle}
                  placeholder="Additional info (optional)"
                  value={additionalInfo}
                  onChange={e => setAdditionalInfo(e.target.value)}
                  onFocus={() => setFocused('additionalInfo')}
                  onBlur={() => setFocused(null)}
                />
              </div>
            </>
          )}
        </div>

        {/* Price Summary */}
        <div style={{ backgroundColor: t.card, borderRadius: 20, padding: 20, marginBottom: 20, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
          <div style={{ fontSize: 16, fontWeight: 700, color: t.text, marginBottom: 16 }}>Price Summary</div>
          {[
            { label: 'Subtotal', value: subtotal },
            { label: 'Delivery fee', value: deliveryFee },
            { label: 'Service fee', value: serviceFee },
          ].map(({ label, value }) => (
            <div key={label} style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: 12, marginBottom: 12, borderBottom: `1px solid ${t.borderDark}` }}>
              <span style={{ fontSize: 14, color: t.textSub }}>{label}</span>
              <span style={{ fontSize: 14, color: t.text }}>€{value.toFixed(2)}</span>
            </div>
          ))}
          <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: 4 }}>
            <span style={{ fontSize: 17, fontWeight: 800, color: t.text }}>Total</span>
            <span style={{ fontSize: 17, fontWeight: 800, color: t.accent }}>€{total.toFixed(2)}</span>
          </div>
        </div>

        {/* Order button */}
        <button
          onClick={openPayment}
          disabled={loading}
          style={{
            width: '100%', borderRadius: 18, padding: '18px 24px',
            display: 'flex', alignItems: 'center', justifyContent: canOrder ? 'space-between' : 'center',
            fontSize: 17, fontWeight: 800, border: 'none', cursor: canOrder ? 'pointer' : 'not-allowed',
            backgroundColor: canOrder ? t.accent : t.inputBg,
            color: canOrder ? t.accentText : t.textMuted,
            boxShadow: canOrder ? `0 4px 16px ${t.accent}55` : 'none',
            transition: 'all 0.2s',
          }}
        >
          <span>{canOrder ? 'Place Order' : 'Fill in details above'}</span>
          {canOrder && (
            <span style={{ backgroundColor: t.accentText, color: t.accent, borderRadius: 20, padding: '6px 14px', fontSize: 15, fontWeight: 800 }}>
              €{total.toFixed(2)}
            </span>
          )}
        </button>
      </div>

      {showPayment && (
        <PaymentModal
          t={t}
          total={total}
          onClose={() => setShowPayment(false)}
          onPay={handlePayment}
          loading={loading}
        />
      )}
    </div>
  )
}
