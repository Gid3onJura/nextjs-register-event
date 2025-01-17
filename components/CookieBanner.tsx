"use client"

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
        <div className="text-sm">
          <div>
            Diese Website verwendet Cookies, um die Benutzererfahrung zu verbessern. Indem Sie die Website weiterhin
            nutzen, stimmen Sie der Verwendung von Cookies und unseren Datenschutzbestimmungen zu. Für weitere
            Informationen verweisen wir Sie auf unsere Website{" "}
            <a
              className="text-blue-400 hover:text-blue-600"
              target="_blank"
              href="https://shorai-do-kempo.org/meta/datenschutz.html"
            >
              Datenschutz
            </a>
          </div>
        </div>
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
