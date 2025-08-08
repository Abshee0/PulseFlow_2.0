import React from 'react'
import { X, Coffee, Heart, ExternalLink } from 'lucide-react'

const BuyMeCoffeeModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xl w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-100 dark:bg-orange-900/20 rounded-lg">
              <Coffee className="h-5 w-5 text-orange-600 dark:text-orange-400" />
            </div>
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
              Buy Me a Coffee
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
          >
            <X className="h-5 w-5 text-slate-500 dark:text-slate-400" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Coffee className="h-8 w-8 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
              Support PulseFlow Development
            </h3>
            <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
              This app is built and maintained by one person with a passion for creating 
              great productivity tools. Your support helps keep the development going and 
              the servers running!
            </p>
          </div>

          <div className="space-y-4 mb-6">
            <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-700 rounded-lg">
              <Heart className="h-5 w-5 text-red-500" />
              <div>
                <p className="text-sm font-medium text-slate-900 dark:text-white">
                  Show Your Appreciation
                </p>
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  Every coffee helps fuel late-night coding sessions
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-700 rounded-lg">
              <Coffee className="h-5 w-5 text-orange-500" />
              <div>
                <p className="text-sm font-medium text-slate-900 dark:text-white">
                  Support Future Features
                </p>
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  Help prioritize new features and improvements
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <a
              href="https://buymeacoffee.com/pulseflow"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-medium py-3 px-4 rounded-lg transition-all duration-200 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl"
            >
              <Coffee className="h-5 w-5" />
              Buy Me a Coffee
              <ExternalLink className="h-4 w-4" />
            </a>

            <button
              onClick={onClose}
              className="w-full px-4 py-2 text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 rounded-lg transition-colors font-medium"
            >
              Maybe Later
            </button>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-200 dark:border-slate-700">
            <p className="text-xs text-slate-500 dark:text-slate-400 text-center">
              Thank you for using PulseFlow! Your support means the world to me.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default BuyMeCoffeeModal