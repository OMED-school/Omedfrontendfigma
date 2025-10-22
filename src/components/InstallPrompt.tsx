import { X, Download, Smartphone } from "lucide-react";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import { usePWA } from "../hooks/usePWA";
import { useState } from "react";

export function InstallPrompt() {
  const { isInstallable, isInstalled, installApp } = usePWA();
  const [dismissed, setDismissed] = useState(false);

  // Check if we're in an iframe (like Figma preview)
  const inIframe = typeof window !== 'undefined' && window !== window.parent;

  // Don't show in iframe environments or if conditions aren't met
  if (inIframe || isInstalled || !isInstallable || dismissed) {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 md:left-auto md:right-4 md:max-w-sm">
      <Card className="border-2 shadow-lg">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 mt-1">
              <Smartphone className="h-6 w-6 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="mb-1">Install School Ideas</h4>
              <p className="text-sm text-muted-foreground mb-3">
                Add to your home screen for quick access and offline support
              </p>
              <div className="flex gap-2">
                <Button onClick={installApp} size="sm" className="gap-2">
                  <Download className="h-4 w-4" />
                  Install
                </Button>
                <Button
                  onClick={() => setDismissed(true)}
                  size="sm"
                  variant="ghost"
                >
                  Later
                </Button>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setDismissed(true)}
              className="flex-shrink-0 h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
