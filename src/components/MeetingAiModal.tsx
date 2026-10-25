'use client';

import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  Mic, 
  MicOff, 
  Sparkles, 
  FileText, 
  CheckCircle2, 
  Calendar, 
  User, 
  Plus, 
  Trash2, 
  AlertCircle, 
  ArrowRight, 
  BookOpen, 
  Check, 
  Clock, 
  ListChecks,
  Volume2
} from 'lucide-react';
import { OperationalRole, GovernanceAction, DailyRitual } from '@/lib/types';

interface MeetingAiModalProps {
  isOpen: boolean;
  onClose: () => void;
  roles: OperationalRole[];
  currentRole: OperationalRole | null;
  activeRitual?: DailyRitual | null;
  selectedDate: string;
  onActionsGenerated?: () => void;
  onMinuteSaved?: () => void;
}

export const MeetingAiModal: React.FC<MeetingAiModalProps> = ({
  isOpen,
  onClose,
  roles,
  currentRole,
  activeRitual,
  selectedDate,
  onActionsGenerated,
  onMinuteSaved
}) => {
  const [mode, setMode] = useState<'record' | 'paste'>('record');
  const [isRecording, setIsRecording] = useState(false);
  const [transcriptText, setTranscriptText] = useState('');
  const [participantsText, setParticipantsText] = useState('Cristiano Silva (CEO)\nMarcos Oliveira (Head de Operações)\nLucas Ribeiro (DP)\nAna Beatriz (Controladoria)');
  const [meetingTitle, setMeetingTitle] = useState('');
  
  // Audio recognition & speech
  const recognitionRef = useRef<any>(null);
  const [speechSupported, setSpeechSupported] = useState(true);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const timerRef = useRef<any>(null);

  // AI Output state
  const [isProcessing, setIsProcessing] = useState(false);
  const [step, setStep] = useState<'input' | 'review'>('input');
  const [summary, setSummary] = useState('');
  const [deliberations, setDeliberations] = useState('');
  const [keyDecisions, setKeyDecisions] = useState<string[]>([]);
  const [actions, setActions] = useState<any[]>([]);

  // Final confirmation flags
  const [saveToCentral, setSaveToCentral] = useState(true);
  const [saveToMinuteBook, setSaveToMinuteBook] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successSaved, setSuccessSaved] = useState(false);

  useEffect(() => {
    if (activeRitual) {
      setMeetingTitle(`Despacho Presencial • ${activeRitual.title}`);
    } else if (currentRole) {
      setMeetingTitle(`Despacho de Governança • ${currentRole.title}`);
    } else {
      setMeetingTitle('Reunião de Alinhamento Diretoria Executiva');
    }
  }, [activeRitual, currentRole]);

  // Setup Web Speech API for real-time in-person recording
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'pt-BR';

        recognition.onresult = (event: any) => {
          let currentSessionText = '';
          for (let i = event.resultIndex; i < event.results.length; i++) {
            const transcript = event.results[i][0].transcript;
            if (event.results[i].isFinal) {
              setTranscriptText(prev => prev ? `${prev}\n${transcript}` : transcript);
            } else {
              currentSessionText += transcript;
            }
          }
        };

        recognition.onerror = (event: any) => {
          console.warn('Speech recognition event:', event.error);
        };

        recognitionRef.current = recognition;
      } else {
        setSpeechSupported(false);
      }
    }

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {}
      }
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  // Timer for active recording
  useEffect(() => {
    if (isRecording) {
      timerRef.current = setInterval(() => {
        setRecordingDuration(prev => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRecording]);

  const toggleRecording = () => {
    if (!recognitionRef.current && !speechSupported) {
      alert('Seu navegador não suporta captura direta por voz. Utilize a aba "Digitar / Colar Transcrição".');
      setMode('paste');
      return;
    }

    if (isRecording) {
      try {
        recognitionRef.current.stop();
      } catch (e) {}
      setIsRecording(false);
    } else {
      try {
        recognitionRef.current.start();
        setIsRecording(true);
      } catch (e) {
        console.error('Error starting speech recognition:', e);
        setIsRecording(false);
      }
    }
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleLoadSample = () => {
    setMode('paste');
    setTranscriptText(`Cristiano Silva (CEO): Bom dia time. Marcos, como estamos de cobertura de postos para os contratos de facilities nesta semana? Tivemos algum problema no contrato do Shopping e nos hospitais?
Marcos Oliveira (Head de Operações): Cristiano, na mesa de operações de hoje estamos com 100% de cobertura. Tivemos 2 faltas de portaria pela manhã, mas já ativamos a reserva técnica e os folguistas já assumiram às 07:30. Sobre as auditorias, já realizei 9 vistorias no Checklist Fácil dos 14 contratos da Zona Sul. Vou finalizar os outros 5 postos até quinta-feira dia 28 com relatório fotográfico.
Cristiano Silva (CEO): Excelente Marcos. Não deixe passar nenhum posto sem o checklist auditado. Lucas, e a respeito do DP? O fechamento do ponto é dia 25 e as rescisões trabalhistas precisam de atenção total para não estourarmos o prazo dos 10 dias da CLT.
Lucas Ribeiro (DP): Cristiano, estamos conferindo as marcações biométricas diariamente. Dois postos apresentaram inconsistências de batida no aplicativo móvel, mas já acionei os supervisores para regularizar hoje. Quanto às 3 rescisões críticas da semana, todos os cálculos já estão pré-aprovados e vamos homologar até quarta-feira dia 27 sem risco de multa.
Cristiano Silva (CEO): Perfeito. Ana, da Controladoria: vi que tem uma nota com divergência de produtos químicos de limpeza. Retenha esse boleto do contas a pagar até o refaturamento correto pelo fornecedor. Os pagamentos aprovados libero hoje às 14:30 no DDA.`);
  };

  const handleProcessWithAi = async () => {
    if (!transcriptText || transcriptText.trim().length === 0) {
      alert('Por favor, grave o áudio ou insira o texto da reunião para processar.');
      return;
    }

    setIsProcessing(true);
    try {
      const participants = participantsText.split('\n').map(p => p.trim()).filter(Boolean);
      const res = await fetch('/api/ai/meeting-assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          transcript: transcriptText,
          participants,
          roleId: currentRole?.id || roles[0]?.id,
          meetingTitle,
          meetingDate: selectedDate
        })
      });

      if (!res.ok) {
        throw new Error('Falha na resposta do assistente de IA');
      }

      const data = await res.json();
      setSummary(data.summary || '');
      setDeliberations(data.deliberations || '');
      setKeyDecisions(data.keyDecisions || []);
      setActions(data.actions || []);
      setStep('review');
    } catch (err) {
      console.error('Error processing meeting:', err);
      alert('Erro ao processar reunião com o Agente de IA. Tente novamente.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleUpdateAction = (index: number, field: string, value: any) => {
    setActions(prev => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: value };
      return copy;
    });
  };

  const handleRemoveAction = (index: number) => {
    setActions(prev => prev.filter((_, i) => i !== index));
  };

  const handleAddManualAction = () => {
    const defaultRole = roles[0];
    setActions(prev => [
      ...prev,
      {
        title: 'Nova ação deliberada na reunião',
        assigneeName: defaultRole.title,
        roleId: defaultRole.id,
        roleTitle: defaultRole.title,
        roleCode: defaultRole.code || 'CAD',
        dueDate: selectedDate,
        status: 'pending',
        priority: 'medium',
        category: 'Governança & Rotina',
        notes: 'Adicionada manualmente durante a revisão executiva da reunião.'
      }
    ]);
  };

  const handleSaveAll = async () => {
    setIsSubmitting(true);
    try {
      const participants = participantsText.split('\n').map(p => p.trim()).filter(Boolean);
      let minuteId = '';

      // 1. Salvar no Livro de Atas se marcado
      if (saveToMinuteBook) {
        const minuteRes = await fetch('/api/minutes', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ritualId: activeRitual?.id || 'rit-ai-01',
            roleId: currentRole?.id || roles[0]?.id,
            date: selectedDate,
            title: meetingTitle,
            deliberations: `${summary}\n\n### Deliberações da Diretoria\n${deliberations}`,
            agendaCheckedCount: actions.length,
            agendaTotalCount: actions.length,
            signedBy: 'Cristiano Silva (Diretoria Executiva / CEO)',
            participants
          })
        });
        if (minuteRes.ok) {
          const createdMin = await minuteRes.json();
          minuteId = createdMin.id;
          if (onMinuteSaved) onMinuteSaved();
        }
      }

      // 2. Salvar Ações na Central 5W2H se marcado
      if (saveToCentral && actions.length > 0) {
        const payload = actions.map(act => ({
          ...act,
          minuteId: minuteId || undefined,
          minuteTitle: meetingTitle,
          ritualId: activeRitual?.id || undefined,
          meetingDate: selectedDate
        }));

        await fetch('/api/actions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });

        if (onActionsGenerated) onActionsGenerated();
      }

      setSuccessSaved(true);
      setTimeout(() => {
        onClose();
        setSuccessSaved(false);
        setStep('input');
        setTranscriptText('');
      }, 1500);

    } catch (err) {
      console.error('Error saving meeting results:', err);
      alert('Erro ao salvar as ações e a ata. Verifique os dados.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200">
      <div className="w-full max-w-4xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl text-slate-800 dark:text-slate-100 my-6 transition-all overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Modal Top Header */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/70 dark:bg-slate-900/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-atlas-600 to-emerald-400 text-white flex items-center justify-center shadow-md">
              <Sparkles className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-900 dark:text-white tracking-tight">
                  Agente de Reunião com IA • Transcrição & Central 5W2H
                </h3>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                  Multimodal
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Grave na sala presencial ou cole a conversa. A IA gera o relatório executivo e atribui tarefas com prazos e anotações.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-white rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {step === 'input' ? (
            <>
              {/* Meeting Header Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Título do Despacho / Pauta Central
                  </label>
                  <input
                    type="text"
                    value={meetingTitle}
                    onChange={(e) => setMeetingTitle(e.target.value)}
                    className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-slate-400"
                    placeholder="Ex: Despacho Presencial • Operações & Financeiro"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Data da Sessão
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="date"
                      value={selectedDate}
                      disabled
                      className="w-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-600 dark:text-slate-300 cursor-not-allowed"
                    />
                    <span className="text-[11px] text-slate-400 font-mono shrink-0">Hoje</span>
                  </div>
                </div>
              </div>

              {/* Mode Selection Tabs */}
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setMode('record')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-2 transition-colors cursor-pointer ${
                      mode === 'record'
                        ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-xs'
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    <Mic className="w-3.5 h-3.5" />
                    <span>Gravar na Sala Presencial</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setMode('paste')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-2 transition-colors cursor-pointer ${
                      mode === 'paste'
                        ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-xs'
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>Digitar / Colar Transcrição</span>
                  </button>
                </div>

                <button
                  type="button"
                  onClick={handleLoadSample}
                  className="text-xs text-atlas-600 dark:text-atlas-400 hover:underline flex items-center gap-1 cursor-pointer font-medium"
                >
                  <Sparkles className="w-3 h-3" />
                  <span>Carregar Diálogo de Exemplo Real</span>
                </button>
              </div>

              {/* In-Person Recording Panel */}
              {mode === 'record' ? (
                <div className="space-y-4">
                  <div className="p-6 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/30 flex flex-col items-center justify-center text-center">
                    
                    <div className="relative mb-4">
                      {isRecording && (
                        <div className="absolute inset-0 rounded-full bg-rose-500 animate-ping opacity-25" />
                      )}
                      <button
                        type="button"
                        onClick={toggleRecording}
                        className={`w-16 h-16 rounded-full flex items-center justify-center text-white shadow-lg transition-transform active:scale-95 cursor-pointer ${
                          isRecording 
                            ? 'bg-rose-600 hover:bg-rose-700' 
                            : 'bg-atlas-600 hover:bg-atlas-700'
                        }`}
                      >
                        {isRecording ? <MicOff className="w-7 h-7" /> : <Mic className="w-7 h-7" />}
                      </button>
                    </div>

                    <div className="space-y-1">
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                        {isRecording ? 'Capturando áudio da reunião presencial...' : 'Clique para Iniciar a Gravação'}
                      </h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md">
                        {isRecording 
                          ? `Tempo de gravação: ${formatDuration(recordingDuration)}. A IA está ouvindo e transcrevendo as falas.` 
                          : 'Deixe o celular ou computador no centro da mesa da sala de reunião e clique no botão acima.'}
                      </p>
                    </div>

                    {isRecording && (
                      <div className="mt-4 flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-50 dark:bg-rose-950/80 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-xs font-mono font-medium">
                        <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                        <span>GRAVANDO • {formatDuration(recordingDuration)}</span>
                      </div>
                    )}
                  </div>

                  {/* Realtime Live Text Preview */}
                  <div>
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                      Transcrição Capturada em Tempo Real (ou edite abaixo):
                    </label>
                    <textarea
                      value={transcriptText}
                      onChange={(e) => setTranscriptText(e.target.value)}
                      rows={5}
                      placeholder="As falas dos participantes aparecerão aqui automaticamente durante a gravação..."
                      className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-3 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-slate-400 font-sans leading-relaxed"
                    />
                  </div>
                </div>
              ) : (
                /* Paste Text Panel */
                <div className="space-y-3">
                  <div>
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                      Cole a transcrição da reunião, notas brutas ou áudio do WhatsApp transcrito:
                    </label>
                    <textarea
                      value={transcriptText}
                      onChange={(e) => setTranscriptText(e.target.value)}
                      rows={8}
                      placeholder="Ex: Cristiano: Marcos, como ficou o contrato Solar? Marcos: Já cobrimos os postos com a reserva técnica e visitei 9 contratos..."
                      className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-3 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-slate-400 font-sans leading-relaxed"
                    />
                  </div>
                </div>
              )}

              {/* Participants in the Room */}
              <div className="bg-slate-50 dark:bg-slate-900/60 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-2 mb-2">
                  <User className="w-4 h-4 text-slate-500" />
                  <span className="text-xs font-semibold text-slate-900 dark:text-white">
                    Participantes Presentes na Sala (Ajuda a IA a separar as vozes):
                  </span>
                </div>
                <textarea
                  value={participantsText}
                  onChange={(e) => setParticipantsText(e.target.value)}
                  rows={2}
                  className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-2.5 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-slate-400"
                  placeholder="Um nome por linha (ex: Cristiano Silva [CEO], Marcos Oliveira [Head Operações])"
                />
              </div>
            </>
          ) : (
            /* STEP 2: REVIEW & EDIT AI EXTRACTED CONTENT */
            <div className="space-y-6 animate-in fade-in">
              
              {/* Executive Summary Card */}
              <div className="bg-slate-50 dark:bg-slate-900/60 p-4 rounded-xl border border-slate-200 dark:border-slate-800 space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
                  <div className="flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-atlas-600 dark:text-atlas-400" />
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                      Resumo Executivo da Reunião
                    </h4>
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono">Gerado por IA</span>
                </div>
                <textarea
                  value={summary}
                  onChange={(e) => setSummary(e.target.value)}
                  rows={4}
                  className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-3 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-slate-400 leading-relaxed font-sans"
                />
              </div>

              {/* Extracted 5W2H Action Items */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ListChecks className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                      Plano de Ação 5W2H Extraído ({actions.length} ações identificadas)
                    </h4>
                  </div>
                  <button
                    type="button"
                    onClick={handleAddManualAction}
                    className="px-2.5 py-1 rounded-md bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-medium flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Adicionar Ação</span>
                  </button>
                </div>

                <div className="space-y-3">
                  {actions.map((action, idx) => (
                    <div 
                      key={idx}
                      className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111827] shadow-xs space-y-3 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 space-y-2">
                          <div className="flex items-center gap-2">
                            <span className="w-5 h-5 rounded-full bg-atlas-100 dark:bg-atlas-950 text-atlas-700 dark:text-atlas-300 flex items-center justify-center text-[10px] font-bold">
                              {idx + 1}
                            </span>
                            <input
                              type="text"
                              value={action.title}
                              onChange={(e) => handleUpdateAction(idx, 'title', e.target.value)}
                              className="flex-1 bg-transparent font-semibold text-xs text-slate-900 dark:text-white focus:outline-none focus:border-b focus:border-slate-400"
                              placeholder="O que fazer (Ação)"
                            />
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
                            {/* Cadeira Responsável */}
                            <div>
                              <label className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold block mb-0.5">
                                Cadeira Responsável
                              </label>
                              <select
                                value={action.roleId}
                                onChange={(e) => {
                                  const r = roles.find(ro => ro.id === e.target.value);
                                  handleUpdateAction(idx, 'roleId', e.target.value);
                                  if (r) {
                                    handleUpdateAction(idx, 'roleTitle', r.title);
                                    handleUpdateAction(idx, 'roleCode', r.code || 'CAD');
                                    handleUpdateAction(idx, 'assigneeName', r.title);
                                  }
                                }}
                                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-md px-2 py-1 text-xs text-slate-800 dark:text-slate-200"
                              >
                                {roles.map(r => (
                                  <option key={r.id} value={r.id}>
                                    {r.title} ({r.code || 'CAD'})
                                  </option>
                                ))}
                              </select>
                            </div>

                            {/* Prazo */}
                            <div>
                              <label className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold block mb-0.5">
                                Prazo Limite
                              </label>
                              <input
                                type="date"
                                value={action.dueDate}
                                onChange={(e) => handleUpdateAction(idx, 'dueDate', e.target.value)}
                                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-md px-2 py-1 text-xs text-slate-800 dark:text-slate-200"
                              />
                            </div>

                            {/* Tema / Categoria */}
                            <div>
                              <label className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold block mb-0.5">
                                Tema / Rito
                              </label>
                              <input
                                type="text"
                                value={action.category}
                                onChange={(e) => handleUpdateAction(idx, 'category', e.target.value)}
                                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-md px-2 py-1 text-xs text-slate-800 dark:text-slate-200"
                                placeholder="Tema da ação"
                              />
                            </div>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleRemoveAction(idx)}
                          className="p-1 text-slate-400 hover:text-rose-500 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                          title="Remover ação"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Locação de Anotações e Acompanhamento */}
                      <div>
                        <label className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold block mb-0.5">
                          Locação para Anotações de Acompanhamento (Notas Contínuas)
                        </label>
                        <input
                          type="text"
                          value={action.notes}
                          onChange={(e) => handleUpdateAction(idx, 'notes', e.target.value)}
                          placeholder="Notas de acompanhamento para despachos futuros..."
                          className="w-full bg-slate-50/70 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-md px-2.5 py-1.5 text-xs text-slate-700 dark:text-slate-300"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Consolidate Checkboxes */}
              <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/40 space-y-2">
                <span className="text-xs font-bold text-slate-900 dark:text-white block mb-1">
                  Destino das Informações:
                </span>
                <label className="flex items-center gap-2.5 text-xs text-slate-700 dark:text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={saveToCentral}
                    onChange={(e) => setSaveToCentral(e.target.checked)}
                    className="rounded border-slate-300 text-atlas-600 focus:ring-atlas-500"
                  />
                  <span>
                    <strong>Injetar Ações na Central de Ações 5W2H</strong> (com filtros por responsável, tema, status e prazos).
                  </span>
                </label>

                <label className="flex items-center gap-2.5 text-xs text-slate-700 dark:text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={saveToMinuteBook}
                    onChange={(e) => setSaveToMinuteBook(e.target.checked)}
                    className="rounded border-slate-300 text-atlas-600 focus:ring-atlas-500"
                  />
                  <span>
                    <strong>Lavrar Ata Oficial no Livro de Atas</strong> com carimbo de horário e assinatura digital do CEO.
                  </span>
                </label>
              </div>

            </div>
          )}

        </div>

        {/* Modal Bottom Footer Actions */}
        <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/70 dark:bg-slate-900/60">
          {step === 'input' ? (
            <>
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-lg text-xs font-semibold text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors cursor-pointer"
              >
                Cancelar
              </button>

              <button
                type="button"
                onClick={handleProcessWithAi}
                disabled={isProcessing || !transcriptText.trim()}
                className="px-5 py-2 rounded-lg bg-atlas-600 hover:bg-atlas-700 disabled:opacity-50 text-white font-semibold text-xs flex items-center gap-2 transition-colors shadow-xs cursor-pointer"
              >
                <Sparkles className="w-4 h-4 text-white" />
                <span>{isProcessing ? 'Processando com IA...' : 'Processar Reunião com IA'}</span>
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={() => setStep('input')}
                disabled={isSubmitting}
                className="px-4 py-2 rounded-lg text-xs font-semibold text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors cursor-pointer"
              >
                ← Voltar e Ajustar Transcrição
              </button>

              <button
                type="button"
                onClick={handleSaveAll}
                disabled={isSubmitting || successSaved}
                className="px-5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-semibold text-xs flex items-center gap-2 transition-colors shadow-xs cursor-pointer"
              >
                {successSaved ? (
                  <>
                    <Check className="w-4 h-4 text-white" />
                    <span>Ata & Ações Salvas com Sucesso!</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-white" />
                    <span>{isSubmitting ? 'Consolidando...' : 'Consolidar Ata & Injetar na Central de Ações'}</span>
                  </>
                )}
              </button>
            </>
          )}
        </div>

      </div>
    </div>
  );
};
