"use client";

import { useLanguage } from "@/lib/i18n/context";
import { formatCurrency } from "@/lib/utils";
import { 
  ArrowUpRight, 
  ArrowDownLeft, 
  CreditCard, 
  ShoppingBag, 
  Plus, 
  Clock,
  CheckCircle2,
  XCircle,
  MoreVertical
} from "lucide-react";

interface Transaction {
  id: string;
  amount: number;
  type: string;
  status: string;
  description: string;
  createdAt: string;
}

interface WalletOverviewProps {
  balance: number;
  transactions: Transaction[];
  onDeposit: () => void;
}

export default function WalletOverview({ balance, transactions, onDeposit }: WalletOverviewProps) {
  const { t } = useLanguage();

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Mini Cards stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Virtual Card */}
        <div className="md:col-span-2 relative h-48 sm:h-56 rounded-2xl overflow-hidden shadow-2xl group transition-all hover:shadow-primary-500/20">
          <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-primary-900 to-slate-900">
             {/* Background Patterns */}
             <div className="absolute top-0 right-0 w-64 h-64 bg-primary-500/20 rounded-full blur-[80px] -mr-32 -mt-32 transition-colors group-hover:bg-primary-400/30" />
             <div className="absolute bottom-0 left-0 w-48 h-48 bg-blue-500/10 rounded-full blur-[60px] -ml-24 -mb-24" />
             
             {/* Card Chip & Network */}
             <div className="absolute top-6 left-8 flex flex-col gap-1 items-start">
               <div className="flex items-center gap-3">
                 <div className="w-10 h-7 bg-amber-400/80 rounded-md shadow-inner" />
                 <span className="text-white/40 text-[10px] uppercase tracking-tighter">Digital Wallet Card</span>
               </div>
             </div>
             
             <div className="absolute top-6 right-8 opacity-40">
               <svg className="w-12 h-12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1">
                 <circle cx="9" cy="12" r="7" />
                 <circle cx="15" cy="12" r="7" />
               </svg>
             </div>

             {/* Balance */}
             <div className="absolute top-20 left-8">
               <p className="text-white/60 text-xs uppercase tracking-[0.2em] mb-1">Available Balance</p>
               <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
                 {formatCurrency(balance, 'VND')}
               </h2>
             </div>

             {/* Action Buttons */}
             <div className="absolute bottom-6 left-8 right-8 flex items-center justify-between">
               <div className="text-white/80 font-mono tracking-widest text-sm">
                 **** **** **** {String(Math.floor(balance)).slice(-4) || '0000'}
               </div>
               <button 
                 onClick={onDeposit}
                 className="flex items-center gap-2 px-4 py-2 bg-white text-slate-900 rounded-full text-xs font-bold hover:bg-primary-50 transition-all active:scale-95 shadow-lg"
               >
                 <Plus className="w-3.5 h-3.5" /> Quick Deposit
               </button>
             </div>
          </div>
        </div>

        {/* Info Card */}
        <div className="bg-white border border-slate-100 rounded-2xl p-6 flex flex-col justify-between shadow-sm">
           <div>
             <div className="w-10 h-10 bg-green-50 text-green-600 rounded-xl flex items-center justify-center mb-4">
               <ShoppingBag className="w-5 h-5" />
             </div>
             <p className="text-slate-500 text-sm font-medium">Monthly Spending</p>
             <h3 className="text-2xl font-bold text-slate-800">$0.00</h3>
           </div>
           <div className="mt-4 pt-4 border-t border-slate-50">
             <div className="flex items-center text-xs text-green-600 gap-1">
               <ArrowUpRight className="w-3 h-3" />
               <span className="font-semibold">0%</span>
               <span className="text-slate-400">vs last month</span>
             </div>
           </div>
        </div>
      </div>

      {/* Transactions Section */}
      <div className="mt-8">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            Recent Transactions
            <span className="text-[10px] font-normal px-2 py-0.5 bg-slate-100 rounded-full text-slate-500 uppercase tracking-wider">Updates live</span>
          </h3>
          <button className="text-xs font-semibold text-primary-600 hover:text-primary-700">View all report</button>
        </div>

        <div className="bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-sm">
           {transactions.length === 0 ? (
             <div className="py-20 flex flex-col items-center justify-center text-center px-6">
                <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                  <CreditCard className="w-8 h-8 text-slate-300" />
                </div>
                <h4 className="text-slate-800 font-semibold mb-1">No transactions yet</h4>
                <p className="text-slate-500 text-sm max-w-[240px]">Your financial activities will show up here as they occur.</p>
             </div>
           ) : (
             <div className="divide-y divide-slate-50">
                {transactions.map((tx) => (
                  <div key={tx.id} className="p-4 flex items-center justify-between hover:bg-slate-50/50 transition-colors group">
                    <div className="flex items-center gap-4">
                      <div className={`w-11 h-11 rounded-14 flex items-center justify-center ${
                        tx.type === 'DEPOSIT' 
                          ? 'bg-blue-50 text-blue-600' 
                          : tx.type === 'WITHDRAW' 
                            ? 'bg-orange-50 text-orange-600'
                            : 'bg-indigo-50 text-indigo-600'
                      }`}>
                        {tx.type === 'DEPOSIT' && <ArrowDownLeft className="w-5 h-5" />}
                        {tx.type === 'WITHDRAW' && <ArrowUpRight className="w-5 h-5" />}
                        {tx.type === 'PAYMENT' && <ShoppingBag className="w-5 h-5" />}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-800 group-hover:text-primary-600 transition-colors">
                          {tx.description}
                        </p>
                        <div className="flex items-center gap-3 text-xs text-slate-500 mt-0.5">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {new Date(tx.createdAt).toLocaleDateString()}
                          </span>
                          <span className="flex items-center gap-1 capitalize">
                            {tx.status === 'COMPLETED' && <CheckCircle2 className="w-3 h-3 text-green-500" />}
                            {tx.status === 'PENDING' && <Clock className="w-3 h-3 text-amber-500" />}
                            {tx.status === 'FAILED' && <XCircle className="w-3 h-3 text-red-500" />}
                            {tx.status.toLowerCase()}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4">
                       <div className="text-right">
                         <p className={`text-sm font-bold ${
                           tx.type === 'DEPOSIT' ? 'text-green-600' : 'text-slate-800'
                         }`}>
                           {tx.type === 'DEPOSIT' ? '+' : '-'}{formatCurrency(tx.amount, 'VND')}
                         </p>
                         <p className="text-[10px] text-slate-400 font-mono uppercase tracking-tighter">
                           ID: #{tx.id.slice(-6).toUpperCase()}
                         </p>
                       </div>
                       <button className="p-2 text-slate-300 hover:text-slate-600 rounded-lg transition-colors">
                         <MoreVertical className="w-4 h-4" />
                       </button>
                    </div>
                  </div>
                ))}
             </div>
           )}
        </div>
      </div>
    </div>
  );
}
