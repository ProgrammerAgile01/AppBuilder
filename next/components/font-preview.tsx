"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export function FontPreview() {
  const detectOS = () => {
    if (typeof window === "undefined") return "Server"
    const userAgent = window.navigator.userAgent
    if (userAgent.includes("Mac")) return "macOS"
    if (userAgent.includes("Win")) return "Windows"
    if (userAgent.includes("Linux")) return "Linux"
    return "Unknown"
  }

  const getFontInfo = () => {
    if (typeof window === "undefined") return { font: "Server-side", os: "Server" }

    const testElement = document.createElement("div")
    testElement.style.fontFamily =
      "Segoe UI, -apple-system, BlinkMacSystemFont, system-ui, Roboto, Helvetica Neue, Arial, sans-serif"
    document.body.appendChild(testElement)

    const computedStyle = window.getComputedStyle(testElement)
    const actualFont = computedStyle.fontFamily

    document.body.removeChild(testElement)

    return {
      font: actualFont.split(",")[0].replace(/['"]/g, ""),
      os: detectOS(),
    }
  }

  const fontInfo = getFontInfo()

  const platformFonts = {
    Windows: {
      primary: "Segoe UI",
      description: "Font bawaan Windows 10/11 yang modern dan readable",
      color: "bg-blue-100 text-blue-800",
    },
    macOS: {
      primary: "-apple-system / San Francisco",
      description: "Font sistem Apple yang elegant dan clean",
      color: "bg-gray-100 text-gray-800",
    },
    Linux: {
      primary: "system-ui / Roboto",
      description: "Font sistem Linux yang konsisten dengan Material Design",
      color: "bg-green-100 text-green-800",
    },
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Font Preview & Detection
            <Badge variant="outline">{fontInfo.os}</Badge>
          </CardTitle>
          <CardDescription>Testing font consistency across different operating systems</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 bg-muted rounded-lg">
            <p className="text-sm text-muted-foreground mb-2">Current Font:</p>
            <p className="font-semibold text-lg">{fontInfo.font}</p>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {Object.entries(platformFonts).map(([platform, info]) => (
              <Card key={platform} className="relative">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">{platform}</CardTitle>
                    <Badge className={info.color}>{info.primary}</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{info.description}</p>

                  <div className="mt-3 space-y-2">
                    <div className="text-xs font-mono bg-muted p-2 rounded">Font Stack Priority:</div>
                    <div className="text-xs text-muted-foreground">
                      {platform === "Windows" && "1. Segoe UI → 2. system-ui → 3. Arial"}
                      {platform === "macOS" && "1. -apple-system → 2. San Francisco → 3. Helvetica"}
                      {platform === "Linux" && "1. system-ui → 2. Roboto → 3. Arial"}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="space-y-3">
            <h4 className="font-semibold">Font Rendering Test:</h4>
            <div className="space-y-2">
              <p className="text-xs">Extra Small Text - 12px</p>
              <p className="text-sm">Small Text - 14px</p>
              <p className="text-base">Base Text - 16px</p>
              <p className="text-lg">Large Text - 18px</p>
              <p className="text-xl font-semibold">Extra Large Text - 20px</p>
              <p className="text-2xl font-bold">Heading Text - 24px</p>
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="font-semibold">Monospace Font Test:</h4>
            <div className="bg-muted p-3 rounded font-mono text-sm">
              <code>
                {`const fontStack = {
  windows: "Consolas",
  macos: "SFMono-Regular", 
  linux: "Liberation Mono"
}`}
              </code>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
