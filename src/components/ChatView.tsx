import React, { useRef, useState } from "react";
import {
  ArrowUpRight,
  Check,
  MessageSquareText,
  RefreshCw,
  Send,
  Sparkles,
  User,
  Users,
} from "lucide-react";
import {
  ChatMessage,
  DialectOption,
  PlatformTarget,
  ScriptMode,
  ScriptProposal,
} from "../types/studio";

interface ChatViewProps {
  messages: ChatMessage[];
  onSendMessage: (text: string) => Promise<void>;
  isSending: boolean;
  selectedDialect: DialectOption;
  scriptMode: ScriptMode;
  onChangeScriptMode: (mode: ScriptMode) => void;
  platformTarget: PlatformTarget;
  onApplyProposal: (proposal: ScriptProposal) => void;
}

const QUICK_IDEA_PROMPTS = [
  "اكتب لي إعلاناً تشويقياً لعلامة عطور فاخرة بخصم 30% وشحن مجاني",
  "حوار ثنائي طريف ومقنع لمطعم مشويات على الفحم بعرض عائلي",
  "إعلان ريلز سريع لعيادة أسنان وتجميل بخصم لأول 20 حجزاً",
  "سكربت قوي لشركة تسويق إلكتروني واستعادة الحسابات المعطلة",
];

export const ChatView: React.FC<ChatViewProps> = ({
  messages,
  onSendMessage,
  isSending,
  selectedDialect,
  scriptMode,
  onChangeScriptMode,
  onApplyProposal,
}) => {
  const [input, setInput] = useState("");
  const [appliedMessageId, setAppliedMessageId] = useState<string | null>(null);
  const listEndRef = useRef<HTMLDivElement | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = input.trim();
    if (!trimmed || isSending) return;
    setInput("");
    await onSendMessage(trimmed);
    window.setTimeout(() => {
      listEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 80);
  };

  const handleUseSuggestion = async (prompt: string) => {
    if (isSending) return;
    await onSendMessage(prompt);
    window.setTimeout(() => {
      listEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 80);
  };

  const handleApply = (msgId: string, proposal: ScriptProposal) => {
    onApplyProposal(proposal);
    setAppliedMessageId(msgId);
    window.setTimeout(() => setAppliedMessageId(null), 2000);
  };

  return (
    <section
      aria-label="مساعد كتابة الإعلانات"
      className="mx-auto max-w-[1040px] space-y-6"
    >
      {/* Context Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-xl border border-white/10 bg-[#131722] p-5">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-500/15 text-amber-400 shrink-0">
            <MessageSquareText className="h-5 w-5" />
          </div>
          <div>
            <h2 className="font-display text-lg font-bold text-slate-100">
              المساعد الإبداعي لصياغة الإعلانات (Chat)
            </h2>
            <p className="mt-0.5 text-xs text-slate-400">
              اكتب فكرة منتجك أو خدمتك، وسيصمم لك المساعد السكربت باللهجة النشطة:{" "}
              <span className="text-amber-300 font-semibold">
                {selectedDialect.flag} {selectedDialect.countryLabel} —{" "}
                {selectedDialect.dialectLabel}
              </span>
            </p>
          </div>
        </div>

        <div className="flex items-center rounded-lg border border-white/10 bg-[#0B0E14] p-0.5 shrink-0">
          <button
            type="button"
            onClick={() => onChangeScriptMode("solo")}
            className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors cursor-pointer whitespace-nowrap ${
              scriptMode === "solo"
                ? "bg-[#1B202E] text-amber-400 font-semibold"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <User className="h-3.5 w-3.5" />
            <span>معلّق منفرد</span>
          </button>
          <button
            type="button"
            onClick={() => onChangeScriptMode("dialogue")}
            className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors cursor-pointer whitespace-nowrap ${
              scriptMode === "dialogue"
                ? "bg-[#1B202E] text-amber-400 font-semibold"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Users className="h-3.5 w-3.5" />
            <span>حوار ثنائي</span>
          </button>
        </div>
      </div>

      {/* Chat Thread */}
      <div className="rounded-xl border border-white/10 bg-[#131722] flex flex-col min-h-[440px] max-h-[62vh]">
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {messages.length === 0 ? (
            <div className="py-10 text-center space-y-5">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-amber-500/10 text-amber-400">
                <Sparkles className="h-6 w-6" />
              </div>
              <div className="max-w-lg mx-auto space-y-1.5">
                <h3 className="font-display text-base font-bold text-slate-100">
                  ابدأ بفكرة إعلانك الآن
                </h3>
                <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                  أخبرني عن المنتج أو العرض أو الجمهور المستهدف، وسأكتب لك هوكاً قوياً وعرضاً مقنعاً وختاماً جاهزاً للتسجيل الصوتي في Preview.
                </p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-w-2xl mx-auto text-right">
                {QUICK_IDEA_PROMPTS.map((prompt) => (
                  <button
                    key={prompt}
                    type="button"
                    onClick={() => handleUseSuggestion(prompt)}
                    disabled={isSending}
                    className="rounded-lg border border-white/10 bg-[#0B0E14] px-3.5 py-2.5 text-xs text-slate-300 hover:border-amber-500/40 hover:text-amber-200 transition-colors text-right cursor-pointer"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            messages.map((msg) => {
              const isUser = msg.role === "user";
              const isApplied = appliedMessageId === msg.id;
              return (
                <div
                  key={msg.id}
                  className={`flex flex-col ${
                    isUser ? "items-start" : "items-end"
                  }`}
                >
                  <div
                    className={`max-w-[88%] rounded-xl px-4 py-3 text-sm leading-relaxed ${
                      isUser
                        ? "bg-[#1B202E] border border-white/10 text-slate-100"
                        : "bg-[#0B0E14] border border-amber-500/25 text-slate-200"
                    }`}
                  >
                    <div className="mb-1 flex items-center gap-2 text-[11px] text-slate-400">
                      <span className="font-semibold text-amber-300">
                        {isUser ? "أنت" : "مخرج Nabra Ads"}
                      </span>
                      {msg.dialectLabel && (
                        <>
                          <span aria-hidden="true">·</span>
                          <span>{msg.dialectLabel}</span>
                        </>
                      )}
                    </div>
                    <p className="whitespace-pre-wrap">{msg.content}</p>

                    {msg.proposal && (
                      <div className="mt-4 pt-3 border-t border-white/10 space-y-2.5">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-xs font-semibold text-amber-300">
                            {msg.proposal.scriptMode === "dialogue"
                              ? "مسودة حوار ثنائي جاهزة للتسجيل"
                              : "مسودة سكربت منفرد جاهزة للتسجيل"}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleApply(msg.id, msg.proposal!)}
                            className="inline-flex items-center gap-1.5 rounded-lg bg-amber-500 px-3 py-1.5 text-xs font-bold text-slate-950 hover:bg-amber-400 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                          >
                            {isApplied ? (
                              <>
                                <Check className="h-3.5 w-3.5" />
                                <span>تم الاعتماد</span>
                              </>
                            ) : (
                              <>
                                <ArrowUpRight className="h-3.5 w-3.5" />
                                <span>اعتماد في Preview</span>
                              </>
                            )}
                          </button>
                        </div>

                        {msg.proposal.scriptMode === "dialogue" ? (
                          <div
                            dir={selectedDialect.dir}
                            className="space-y-1.5 rounded-lg bg-[#131722] p-3 text-xs text-slate-200 leading-relaxed"
                          >
                            {msg.proposal.dialogueHookA && (
                              <p>
                                <strong className="text-amber-300">أ:</strong>{" "}
                                {msg.proposal.dialogueHookA}
                              </p>
                            )}
                            {msg.proposal.dialogueHookB && (
                              <p>
                                <strong className="text-emerald-300">ب:</strong>{" "}
                                {msg.proposal.dialogueHookB}
                              </p>
                            )}
                            {msg.proposal.dialogueBodyA && (
                              <p>
                                <strong className="text-amber-300">أ:</strong>{" "}
                                {msg.proposal.dialogueBodyA}
                              </p>
                            )}
                            {msg.proposal.dialogueBodyB && (
                              <p>
                                <strong className="text-emerald-300">ب:</strong>{" "}
                                {msg.proposal.dialogueBodyB}
                              </p>
                            )}
                            {msg.proposal.dialogueCtaB && (
                              <p>
                                <strong className="text-emerald-300">ب (ختام):</strong>{" "}
                                {msg.proposal.dialogueCtaB}
                              </p>
                            )}
                          </div>
                        ) : (
                          <div
                            dir={selectedDialect.dir}
                            className="space-y-1.5 rounded-lg bg-[#131722] p-3 text-xs text-slate-200 leading-relaxed"
                          >
                            {msg.proposal.hook && (
                              <p>
                                <strong className="text-amber-300">الهوك:</strong>{" "}
                                {msg.proposal.hook}
                              </p>
                            )}
                            {msg.proposal.body && (
                              <p>
                                <strong className="text-slate-300">العرض:</strong>{" "}
                                {msg.proposal.body}
                              </p>
                            )}
                            {msg.proposal.cta && (
                              <p>
                                <strong className="text-emerald-300">الختام:</strong>{" "}
                                {msg.proposal.cta}
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
          {isSending && (
            <div className="flex items-end">
              <div className="rounded-xl border border-amber-500/20 bg-[#0B0E14] px-4 py-3 text-xs text-amber-300 inline-flex items-center gap-2">
                <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                <span>جاري صياغة السكربت بلهجة ({selectedDialect.countryLabel})...</span>
              </div>
            </div>
          )}
          <div ref={listEndRef} />
        </div>

        {/* Input Composer */}
        <form
          onSubmit={handleSubmit}
          className="border-t border-white/10 p-3 sm:p-4 flex items-center gap-2.5 bg-[#0F131D] rounded-b-xl"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="اكتب فكرة الإعلان أو اطلب تعديل السكربت (مثال: اجعل الهوك أقوى وأسرع للريلز)..."
            className="flex-1 rounded-lg border border-white/10 bg-[#0B0E14] px-4 py-2.5 text-sm text-slate-100 placeholder:text-slate-500 focus:border-amber-500/60 focus:outline-none"
          />
          <button
            type="submit"
            disabled={isSending || !input.trim()}
            className="inline-flex items-center gap-2 rounded-lg bg-amber-500 px-4 py-2.5 text-sm font-semibold text-slate-950 hover:bg-amber-400 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap shrink-0 cursor-pointer"
          >
            <Send className="h-4 w-4" />
            <span>إرسال</span>
          </button>
        </form>
      </div>
    </section>
  );
};
