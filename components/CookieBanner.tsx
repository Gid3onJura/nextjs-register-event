import { useState, useEffect } from "react"

const CookieBanner = () => {
  const [showBanner, setShowBanner] = useState(false)

  useEffect(() => {
    const isConsentGiven = localStorage.getItem("cookieConsent")
    if (!isConsentGiven) {
      setShowBanner(true)
    }
  }, [])

  const handleAccept = () => {
    localStorage.setItem("cookieConsent", "true")
    setShowBanner(false)
  }

  return showBanner ? (
    <div className="fixed bottom-0 left-0 right-0 bg-gray-800 text-white p-4 shadow-md">
      <div className="flex items-center justify-between">
        <p className="text-sm">
          Diese Website verwendet Cookies, um die Benutzererfahrung zu verbessern. Durch die weitere Nutzung der Website
          stimmen Sie der Verwendung von Cookies zu.
        </p>
        <button
          onClick={handleAccept}
          className="ml-4 px-3 py-2 bg-blue-500 hover:bg-blue-600 text-white text-sm rounded"
        >
          Akzeptieren
        </button>
      </div>
    </div>
  ) : null
}

export default CookieBanner
