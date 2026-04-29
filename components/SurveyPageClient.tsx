"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Download } from "lucide-react"
import { notify } from "@/util/util"
import jsPDF from "jspdf"
import DashboardPageHeader from "./DashboardPageHeader"
import { User } from "@/util/interfaces"

interface SurveyQuestion {
  id: string
  question: string
  type: "number" | "select" | "multiselect" | "textarea" | "boolean"
  required: boolean
  options?: string[]
  min?: number
  max?: number
}

interface SurveyContent {
  title: string
  description: string
  questions: SurveyQuestion[]
}

interface SurveyItem {
  id: number
  deadline: string
  survey: SurveyContent
}

interface SurveyStats {
  totalResponses: number
  participationAverageUser: number
  questionStats: {
    [questionId: string]: {
      question: string
      type: string
      responses: number
      stats: any
    }
  }
}

function normalizeSurveyStats(data: any, survey: SurveyContent): SurveyStats {
  const rawStats =
    data?.questionStats ??
    data?.stats ??
    (() => {
      const candidate: Record<string, any> = { ...data }
      delete candidate.totalResponses
      return candidate
    })()

  const totalResponses = data?.totalResponses ?? 0
  const participationAverageUser = data?.participationAverageUser ?? 0
  const questionById = survey.questions.reduce<Record<string, SurveyQuestion>>((acc, question) => {
    acc[question.id] = question
    return acc
  }, {})

  const questionStats: Record<string, any> = {}
  Object.entries(rawStats || {}).forEach(([questionId, statsValue]) => {
    const question = questionById[questionId]
    const responses =
      totalResponses > 0
        ? totalResponses
        : typeof statsValue === "object" && !Array.isArray(statsValue)
          ? Object.values(statsValue as Record<string, any>).reduce(
              (sum: number, value: any) => sum + Number(value || 0),
              0,
            )
          : Array.isArray(statsValue)
            ? statsValue.length
            : 0

    questionStats[questionId] = {
      question: question?.question ?? questionId,
      type: question?.type ?? "select",
      responses,
      stats:
        question?.type === "textarea" && typeof statsValue === "object" && !Array.isArray(statsValue)
          ? Object.keys(statsValue as Record<string, any>)
          : statsValue,
    }
  })

  return {
    totalResponses,
    questionStats,
    participationAverageUser,
  }
}

export default function SurveyPageClient() {
  const [surveys, setSurveys] = useState<SurveyItem[]>([])
  const [user, setUser] = useState<User[]>([])
  const [selectedSurvey, setSelectedSurvey] = useState<SurveyItem | null>(null)
  const [stats, setStats] = useState<SurveyStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [surveyData, setSurveyData] = useState<any>(null)
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? ""
  const API_KEY = process.env.NEXT_PUBLIC_API_KEY ?? ""

  useEffect(() => {
    loadSurveys()
    loadAllUser()
    setIsLoading(false)
  }, [])

  useEffect(() => {
    const fetchData = async () => {
      if (selectedSurvey) {
        await loadData()
      }
    }

    fetchData()
  }, [selectedSurvey, user])

  const loadSurveys = async () => {
    try {
      const response = await fetch("/api/survey/all")
      const data = await response.json()
      setSurveys(data)
    } catch (error) {
      console.error("Fehler beim Laden der Umfragen:", error)
      notify("Fehler beim Laden der Umfragen", "error")
      setIsLoading(false)
    }
  }

  const loadAllUser = async () => {
    try {
      const response = await fetch("/api/user")
      const data = await response.json()
      setUser(data)
    } catch (error) {
      console.error("Fehler beim Laden der User:", error)
      notify("Fehler beim Laden der User", "error")
      setIsLoading(false)
    }
  }

  const loadData = async () => {
    if (!selectedSurvey) return

    setIsLoading(true)
    try {
      // Lade Survey-Konfiguration
      const surveyResponse = await fetch(`${API_BASE_URL}/survey/${selectedSurvey.id}`, {
        method: "GET",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          "api-key": API_KEY,
        },
      })
      const surveyResult = await surveyResponse.json()
      const survey = surveyResult?.survey ?? surveyResult

      setSurveyData(survey)

      // Lade Statistiken
      const statsResponse = await fetch(`${API_BASE_URL}/survey/${selectedSurvey.id}/stats`, {
        method: "GET",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          "api-key": API_KEY,
        },
      })
      if (statsResponse.ok) {
        const statsData = await statsResponse.json()
        setStats(normalizeSurveyStats(statsData, survey))
      } else {
        setStats(null)
        notify("Statistiken konnten nicht geladen werden", "error")
      }
    } catch (error) {
      console.error("Fehler beim Laden der Daten:", error)
      notify("Fehler beim Laden der Umfrage-Daten", "error")
    } finally {
      setIsLoading(false)
    }
  }

  const exportToPDF = () => {
    if (!stats || !surveyData) return

    const doc = new jsPDF()
    let yPosition = 20

    // Titel
    doc.setFontSize(20)
    doc.text("Umfrage-Auswertung", 20, yPosition)
    yPosition += 20

    doc.setFontSize(14)
    doc.text(surveyData.title, 20, yPosition)
    yPosition += 10

    doc.setFontSize(12)
    doc.text(`Gesamtanzahl Teilnahmen: ${stats.totalResponses}`, 20, yPosition)
    yPosition += 20

    // Für jede Frage
    surveyData.questions.forEach((question: any) => {
      if (yPosition > 250) {
        doc.addPage()
        yPosition = 20
      }

      doc.setFontSize(14)
      doc.text(question.question, 20, yPosition)
      yPosition += 10

      const questionStat = stats.questionStats[question.id]
      if (questionStat) {
        if (typeof questionStat.stats === "object" && !Array.isArray(questionStat.stats)) {
          Object.entries(questionStat.stats as Record<string, any>).forEach(([option, count]) => {
            const countValue = Number(count)
            const percentage = questionStat.responses ? ((countValue / questionStat.responses) * 100).toFixed(1) : "0.0"
            doc.text(`${option}: ${countValue} (${percentage}%)`, 30, yPosition)
            yPosition += 8
            if (yPosition > 250) {
              doc.addPage()
              yPosition = 20
            }
          })
        } else if (question.type === "number" && Array.isArray(questionStat.stats)) {
          const numbers = questionStat.stats as number[]
          if (numbers.length > 0) {
            const avg = (numbers.reduce((a, b) => a + b, 0) / numbers.length).toFixed(1)
            const min = Math.min(...numbers)
            const max = Math.max(...numbers)
            doc.text(`Durchschnitt: ${avg}, Min: ${min}, Max: ${max}`, 30, yPosition)
            yPosition += 8
            if (yPosition > 250) {
              doc.addPage()
              yPosition = 20
            }
          }
        } else if (question.type === "textarea" && Array.isArray(questionStat.stats)) {
          const comments = questionStat.stats as string[]
          comments.forEach((comment) => {
            const lines = doc.splitTextToSize(comment, 140)
            doc.text(lines, 30, yPosition)
            yPosition += lines.length * 5 + 5
            if (yPosition > 250) {
              doc.addPage()
              yPosition = 20
            }
          })
        }
      }
      yPosition += 10
    })

    // Speichern
    doc.save("umfrage-auswertung.pdf")
    notify("PDF wurde heruntergeladen", "success")
  }

  const renderQuestionStats = (question: SurveyQuestion, questionStats: any) => {
    if (question.type === "select" || question.type === "boolean") {
      return (
        <div className="space-y-2">
          {Object.entries(questionStats.stats as { [key: string]: number }).map(([option, count]) => {
            const percentage = ((count / questionStats.responses) * 100).toFixed(2)
            return (
              <div key={option} className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                <span className="break-words">{option}</span>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <div className="w-24 bg-gray-200 rounded-full h-2">
                    <div className="bg-gray-800 h-2 rounded-full" style={{ width: `${percentage}%` }}></div>
                  </div>
                  <span className="text-sm text-gray-600 w-8 text-right">{count}</span>
                  <span className="text-sm text-gray-600 w-12 text-right">({percentage}%)</span>
                </div>
              </div>
            )
          })}
        </div>
      )
    } else if (question.type === "multiselect") {
      const totalSelections = Object.values(questionStats.stats as { [key: string]: number }).reduce(
        (sum, count) => sum + count,
        0,
      )
      return (
        <div className="space-y-2">
          {Object.entries(questionStats.stats as { [key: string]: number }).map(([option, count]) => {
            const percentage = totalSelections > 0 ? ((count / totalSelections) * 100).toFixed(2) : "0.00"
            return (
              <div key={option} className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                <span className="break-words">{option}</span>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <div className="w-24 bg-gray-200 rounded-full h-2">
                    <div className="bg-gray-800 h-2 rounded-full" style={{ width: `${percentage}%` }}></div>
                  </div>
                  <span className="text-sm text-gray-600 w-8 text-right">{count}</span>
                  <span className="text-sm text-gray-600 w-12 text-right">({percentage}%)</span>
                </div>
              </div>
            )
          })}
        </div>
      )
    } else if (typeof questionStats.stats === "object" && !Array.isArray(questionStats.stats)) {
      return (
        <div className="space-y-2">
          {Object.entries(questionStats.stats).map(([option, count]) => {
            const countValue = Number(count)
            const percentage = questionStats.responses
              ? ((countValue / questionStats.responses) * 100).toFixed(2)
              : "0.00"
            return (
              <div key={option} className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                <span className="break-words">{option}</span>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <div className="w-24 bg-gray-200 rounded-full h-2">
                    <div className="bg-gray-800 h-2 rounded-full" style={{ width: `${percentage}%` }}></div>
                  </div>
                  <span className="text-sm text-gray-600 w-8 text-right">{countValue}</span>
                  <span className="text-sm text-gray-600 w-12 text-right">({percentage}%)</span>
                </div>
              </div>
            )
          })}
        </div>
      )
    } else if (question.type === "number" && Array.isArray(questionStats.stats)) {
      return (
        <div className="space-y-2">
          <p>
            Durchschnitt:{" "}
            {(questionStats.stats as number[]).reduce((a, b) => a + b, 0) / (questionStats.stats as number[]).length}
          </p>
          <p>Minimum: {Math.min(...(questionStats.stats as number[]))}</p>
          <p>Maximum: {Math.max(...(questionStats.stats as number[]))}</p>
        </div>
      )
    } else if (question.type === "textarea" && Array.isArray(questionStats.stats)) {
      return (
        <div className="space-y-4">
          {(questionStats.stats as string[]).map((response, index) => (
            <div key={index}>
              <blockquote className="border-l-4 border-gray-300 pl-4 italic text-gray-600 break-words">
                "{response}"
              </blockquote>
              {index < (questionStats.stats as string[]).length - 1 && <hr className="my-4 border-gray-200" />}
            </div>
          ))}
        </div>
      )
    }
    return null
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white p-4 md:p-8">
      <DashboardPageHeader />
      <div className="flex justify-between items-start mb-6">
        <div className="flex-1 mr-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">Umfrage auswählen</label>
          <Select
            value={selectedSurvey?.id.toString() || ""}
            onValueChange={(value) => {
              const survey = surveys.find((s) => s.id.toString() === value)
              setSelectedSurvey(survey || null)
            }}
          >
            <SelectTrigger className="w-full max-w-md">
              <SelectValue placeholder="Wählen Sie eine Umfrage aus" />
            </SelectTrigger>
            <SelectContent>
              {surveys.map((survey) => (
                <SelectItem key={survey.id} value={survey.id.toString()}>
                  {survey.survey.title} (Deadline: {new Date(survey.deadline).toLocaleDateString("de-DE")})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        {selectedSurvey && stats && surveyData && (
          <Button onClick={exportToPDF} className="bg-gray-800 hover:bg-gray-900 flex items-center gap-2">
            <Download className="h-4 w-4" />
            Als PDF exportieren
          </Button>
        )}
      </div>
      {!selectedSurvey ? (
        <Card>
          <CardHeader>
            <CardTitle>Umfrage-Auswertung</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Bitte wählen Sie eine Umfrage aus, um die Auswertung zu sehen.</p>
          </CardContent>
        </Card>
      ) : !stats || !surveyData ? (
        <Card>
          <CardHeader>
            <CardTitle>Fehler</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Umfrage-Daten konnten nicht geladen werden.</p>
            <Button onClick={loadData} className="mt-4">
              Erneut versuchen
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>{surveyData.title} - Auswertung</CardTitle>
              <CardDescription>
                Deadline: {new Date(selectedSurvey.deadline).toLocaleDateString("de-DE")}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-lg font-semibold">
                Teilnehmer insgesamt: {stats.totalResponses} von {user.length} (
                {stats.participationAverageUser.toFixed(2)}%)
              </p>
            </CardContent>
          </Card>
          <div className="space-y-6">
            {Object.entries(stats.questionStats).map(([questionId, questionStats]) => {
              const question = surveyData.questions.find((q: SurveyQuestion) => q.id === questionId)
              if (!question) return null
              return (
                <Card key={questionId}>
                  <CardHeader>
                    <CardTitle>{question.question}</CardTitle>
                  </CardHeader>
                  <CardContent>{renderQuestionStats(question, questionStats)}</CardContent>
                </Card>
              )
            })}
          </div>
        </>
      )}
    </div>
  )
}
