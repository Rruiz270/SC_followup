import React, { useState, useEffect } from 'react';
import { differenceInDays, differenceInHours, differenceInMinutes } from 'date-fns';
import { Clock, Target } from 'lucide-react';

const CountdownBanner = ({ targetDate = '2026-04-25', compact = false }) => {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const target = new Date(targetDate + 'T23:59:59');
  const days = differenceInDays(target, now);
  const hours = differenceInHours(target, now) % 24;
  const minutes = differenceInMinutes(target, now) % 60;

  const getColor = () => {
    if (days > 30) return { bg: 'from-green-600 to-green-800', text: 'text-green-100', accent: 'text-white' };
    if (days > 15) return { bg: 'from-yellow-500 to-orange-600', text: 'text-yellow-100', accent: 'text-white' };
    return { bg: 'from-red-600 to-red-800', text: 'text-red-100', accent: 'text-white' };
  };

  const colors = getColor();

  if (compact) {
    return (
      <div className={`bg-gradient-to-r ${colors.bg} rounded-lg px-4 py-3 flex items-center justify-between`}>
        <div className="flex items-center space-x-2">
          <Clock className="w-4 h-4 text-white/80" />
          <span className="text-sm text-white/80">Contrato SED-SC</span>
        </div>
        <div className={`text-xl font-bold ${colors.accent}`}>
          {days}d {hours}h
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-gradient-to-r ${colors.bg} rounded-xl p-6 shadow-lg`}>
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center space-x-2 mb-2">
            <Target className="w-5 h-5 text-white/80" />
            <span className={`text-sm font-medium ${colors.text}`}>
              Meta: Assinatura do Contrato com SED-SC
            </span>
          </div>
          <div className="text-sm text-white/70">25 de Abril de 2026</div>
        </div>
        <div className="flex items-center space-x-4">
          <div className="text-center">
            <div className={`text-4xl font-bold ${colors.accent}`}>{days}</div>
            <div className={`text-xs ${colors.text}`}>dias</div>
          </div>
          <div className={`text-2xl font-light ${colors.text}`}>:</div>
          <div className="text-center">
            <div className={`text-4xl font-bold ${colors.accent}`}>{hours}</div>
            <div className={`text-xs ${colors.text}`}>horas</div>
          </div>
          <div className={`text-2xl font-light ${colors.text}`}>:</div>
          <div className="text-center">
            <div className={`text-4xl font-bold ${colors.accent}`}>{minutes}</div>
            <div className={`text-xs ${colors.text}`}>min</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CountdownBanner;
