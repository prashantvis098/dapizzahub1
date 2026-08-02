"use client";

import { motion } from "framer-motion";
import { Check } from "lucide-react";

interface StepperProps {
  currentStep: number;
  steps: string[];
}

export function CheckoutStepper({ currentStep, steps }: StepperProps) {
  return (
    <div className="flex items-center justify-center mb-12">
      {steps.map((step, i) => {
        const stepNum = i + 1;
        const isComplete = stepNum < currentStep;
        const isActive = stepNum === currentStep;

        return (
          <div key={step} className="flex items-center">
            <div className="flex flex-col items-center gap-2">
              <motion.div
                animate={{
                  backgroundColor: isComplete || isActive ? "#E53935" : "#171717",
                  borderColor: isComplete || isActive ? "#E53935" : "rgba(255,255,255,0.1)",
                }}
                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                className="w-9 h-9 rounded-full border flex items-center justify-center text-sm font-semibold"
              >
                {isComplete ? <Check size={16} /> : stepNum}
              </motion.div>
              <span
                className={`text-xs whitespace-nowrap ${
                  isActive ? "text-ink-primary font-medium" : "text-ink-muted"
                }`}
              >
                {step}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div className="w-12 sm:w-20 h-px bg-white/10 mx-2 sm:mx-3 mb-6 relative overflow-hidden">
                <motion.div
                  initial={{ width: "0%" }}
                  animate={{ width: isComplete ? "100%" : "0%" }}
                  transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                  className="absolute inset-y-0 left-0 bg-accent"
                />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
