import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Layout } from '../components/ui/Layout';
import { Badge } from '../components/ui/Badge';
import { EvaluationStep, Idea } from '../types';
import { Check, Loader2, ArrowLeft, Copy, Download, ThumbsUp, ThumbsDown, Clock, ChevronRight, BarChart3, Wrench, Coins } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { cn, pageVariants } from '../lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { getIdea, startEvaluation, getEvaluationStatus, recordDecision, isEvaluationComplete, getEvaluationProgress } from '../lib/api';

export const IdeaDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [idea, setIdea] = useState<Idea | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('summary');
  const [isStartingEvaluation, setIsStartingEvaluation] = useState(false);

  const [evalSteps, setEvalSteps] = useState<EvaluationStep[]>([
    { id: '1', label: 'Mottar idéutkast', status: 'pending' },
    { id: '2', label: 'Markedsanalyse AI', status: 'pending' },
    { id: '3', label: 'Teknisk vurdering', status: 'pending' },
    { id: '4', label: 'Forretningsmodell', status: 'pending' },
    { id: '5', label: 'Genererer rapport', status: 'pending' },
  ]);

  // Fetch idea on mount
  useEffect(() => {
    const fetchIdea = async () => {
      if (!id) return;

      setLoading(true);
      setError(null);

      try {
        const data = await getIdea(id);
        setIdea(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load idea');
        console.error('Failed to fetch idea:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchIdea();
  }, [id]);

  // Poll evaluation status when evaluating
  useEffect(() => {
    if (!id || idea?.status !== 'evaluating') return;

    const pollEvaluation = async () => {
      try {
        const jobStatus = await getEvaluationStatus(id);

        // Update eval steps based on job status
        setEvalSteps([
          { id: '1', label: 'Mottar idéutkast', status: 'completed' },
          {
            id: '2',
            label: 'Markedsanalyse AI',
            status: jobStatus.market_strategist_status === 'completed' ? 'completed' :
                    jobStatus.market_strategist_status === 'running' ? 'running' : 'pending'
          },
          {
            id: '3',
            label: 'Teknisk vurdering',
            status: jobStatus.product_architect_status === 'completed' ? 'completed' :
                    jobStatus.product_architect_status === 'running' ? 'running' : 'pending'
          },
          {
            id: '4',
            label: 'Forretningsmodell',
            status: jobStatus.business_critic_status === 'completed' ? 'completed' :
                    jobStatus.business_critic_status === 'running' ? 'running' : 'pending'
          },
          {
            id: '5',
            label: 'Genererer rapport',
            status: jobStatus.notes_synthesizer_status === 'completed' ? 'completed' :
                    jobStatus.notes_synthesizer_status === 'running' ? 'running' : 'pending'
          },
        ]);

        // If evaluation complete, refresh idea to get results
        if (isEvaluationComplete(jobStatus)) {
          const updatedIdea = await getIdea(id);
          setIdea(updatedIdea);
        }
      } catch (err) {
        console.error('Failed to poll evaluation status:', err);
      }
    };

    // Poll every 2 seconds
    const interval = setInterval(pollEvaluation, 2000);

    // Initial poll
    pollEvaluation();

    return () => clearInterval(interval);
  }, [id, idea?.status]);

  const handleStartEvaluation = async () => {
    if (!id) return;

    setIsStartingEvaluation(true);
    try {
      await startEvaluation(id);
      // Refresh idea to update status to 'evaluating'
      const updatedIdea = await getIdea(id);
      setIdea(updatedIdea);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start evaluation');
      console.error('Failed to start evaluation:', err);
    } finally {
      setIsStartingEvaluation(false);
    }
  };

  const handleDecision = async (decision: 'go' | 'hold' | 'reject', reason: string) => {
    if (!id) return;

    try {
      const updatedIdea = await recordDecision(id, decision, reason);
      setIdea(updatedIdea);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to record decision');
      console.error('Failed to record decision:', err);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center py-24">
          <Loader2 className="w-12 h-12 text-primary animate-spin mb-4" />
          <p className="text-primary-muted">Laster idé...</p>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center py-24">
          <div className="w-16 h-16 rounded-full bg-red-100 border border-red-300 flex items-center justify-center mb-4">
            <span className="text-3xl">⚠️</span>
          </div>
          <h3 className="text-xl font-bold text-red-900 mb-2">Kunne ikke laste idé</h3>
          <p className="text-red-700 mb-4">{error}</p>
          <button
            onClick={() => navigate('/')}
            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
          >
            Tilbake til oversikt
          </button>
        </div>
      </Layout>
    );
  }

  if (!idea) {
    return (
      <Layout>
        <div className="text-center py-20">
          <p className="text-primary-muted">Fant ikke idéen</p>
          <button onClick={() => navigate('/')} className="mt-4 text-primary hover:underline">
            Tilbake til oversikt
          </button>
        </div>
      </Layout>
    );
  }

  // -- RENDER: READY FOR EVALUATION STATE --
  if (idea.status === 'draft' && idea.idea_document) {
    return (
      <Layout>
        <motion.div
          variants={pageVariants}
          initial="initial"
          animate="animate"
          className="max-w-4xl mx-auto space-y-8"
        >
          {/* Back button */}
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-sm font-medium text-primary-muted hover:text-primary transition-colors w-fit"
          >
            <ArrowLeft className="w-4 h-4" />
            Tilbake til oversikt
          </button>

          {/* Header with status badge */}
          <div className="flex flex-col gap-4 border-b border-border pb-6">
            <div className="flex items-center gap-3">
              <Badge status="draft" />
              <span className="text-primary-muted text-sm px-2 border-l border-border font-medium">
                Opprettet {idea.createdAt}
              </span>
            </div>
            <h1 className="text-4xl font-extrabold text-primary tracking-tight">{idea.title}</h1>
            <p className="text-lg text-primary-muted leading-relaxed">{idea.description}</p>
          </div>

          {/* Success message with call to action */}
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-2xl p-8 shadow-sm">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-success flex items-center justify-center flex-shrink-0 shadow-md">
                <Check className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1 space-y-4">
                <div>
                  <h2 className="text-2xl font-extrabold text-primary mb-2">
                    Alt ser bra ut - idéen er klar til å evalueres!
                  </h2>
                  <p className="text-primary-muted leading-relaxed">
                    Idéen din er nå strukturert og klar for evaluering.
                    Våre AI-agenter vil analysere markedspotensialet, teknisk gjennomførbarhet og forretningsmodell.
                    Dette tar ca. 10-15 minutter.
                  </p>
                </div>
                <button
                  onClick={handleStartEvaluation}
                  disabled={isStartingEvaluation}
                  className="flex items-center gap-2 px-8 py-3 bg-accent-primary hover:bg-orange-600 text-white rounded-lg font-bold shadow-md hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isStartingEvaluation ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Starter evaluering...
                    </>
                  ) : (
                    <>
                      <Check className="w-5 h-5" />
                      Start evaluering
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Preview of structured idea document */}
          <div className="bg-white border border-border rounded-2xl p-8 shadow-sm">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-border">
              <h3 className="text-xl font-bold text-primary">Strukturert idéutkast</h3>
              <div className="flex gap-2">
                <button
                  className="p-2 text-primary-muted hover:text-primary hover:bg-surface-elevated rounded-lg transition-colors"
                  title="Kopier"
                >
                  <Copy className="w-4 h-4" />
                </button>
                <button
                  className="p-2 text-primary-muted hover:text-primary hover:bg-surface-elevated rounded-lg transition-colors"
                  title="Last ned"
                >
                  <Download className="w-4 h-4" />
                </button>
              </div>
            </div>
            <div>
              <ReactMarkdown
                components={{
                  p: ({node, children, ...props}) => {
                    const text = String(children);
                    if (text.includes('[Trenger avklaring]')) {
                      return <p className="bg-orange-50 border-l-2 border-orange-300 pl-4 py-3 text-orange-900 text-xs rounded-r-lg font-medium my-2" {...props}>{children}</p>;
                    }
                    return <p className="text-primary-muted leading-7 my-3" {...props}>{children}</p>;
                  },
                  h1: ({node, ...props}) => <h1 className="text-2xl font-extrabold mb-6 mt-2 text-primary tracking-tight" {...props} />,
                  h2: ({node, ...props}) => <h2 className="text-lg font-bold mt-8 mb-3 pb-2 border-b border-border text-primary" {...props} />,
                  h3: ({node, ...props}) => <h3 className="text-base font-bold mt-6 mb-2 text-primary" {...props} />,
                  ul: ({node, ...props}) => <ul className="my-3 space-y-1.5 ml-4" {...props} />,
                  ol: ({node, ...props}) => <ol className="my-3 space-y-1.5 ml-4 list-decimal" {...props} />,
                  li: ({node, ...props}) => <li className="text-primary-muted text-sm leading-6" {...props} />,
                  strong: ({node, ...props}) => <strong className="font-bold text-primary" {...props} />,
                  em: ({node, ...props}) => <em className="italic text-primary" {...props} />,
                  code: ({node, inline, ...props}) =>
                    inline ?
                      <code className="bg-surface-elevated px-1.5 py-0.5 rounded text-xs text-accent-primary font-mono border border-border" {...props} /> :
                      <code className="block bg-surface-elevated p-3 rounded-lg text-xs text-primary font-mono border border-border my-3 overflow-x-auto" {...props} />,
                  blockquote: ({node, ...props}) => <blockquote className="border-l-2 border-accent-primary bg-accent-subtle pl-4 py-2 my-3 rounded-r text-primary italic" {...props} />,
                }}
              >
                {idea.idea_document}
              </ReactMarkdown>
            </div>
          </div>
        </motion.div>
      </Layout>
    );
  }

  // -- RENDER: EVALUATING STATE --
  if (idea.status === 'evaluating') {
    return (
      <Layout>
        <div className="max-w-xl mx-auto mt-20 flex flex-col items-center">
            {/* Clean Loading Animation */}
            <div className="relative w-24 h-24 mb-10 flex items-center justify-center">
                <div className="absolute inset-0 border-4 border-surface-elevated rounded-full"></div>
                <div className="absolute inset-0 border-4 border-accent-primary rounded-full border-t-transparent animate-spin"></div>
                <Loader2 className="w-8 h-8 text-accent-primary animate-pulse" />
            </div>

            <h2 className="text-2xl font-extrabold text-primary mb-2">Analyserer idéen din</h2>
            <p className="text-primary-muted mb-10 text-center font-medium">Våre AI-agenter jobber med saken.<br/>Dette tar ca. 10 sekunder.</p>

            <div className="w-full space-y-3">
                {evalSteps.map((step) => (
                    <div key={step.id} className="flex items-center gap-4 p-4 rounded-xl bg-white border border-border shadow-sm">
                        <div className={cn(
                            "w-6 h-6 rounded-full flex items-center justify-center border transition-colors duration-500",
                            step.status === 'completed' ? "bg-success text-white border-success" :
                            step.status === 'running' ? "bg-white border-accent-primary text-accent-primary" :
                            "bg-surface-elevated border-border text-gray-300"
                        )}>
                            {step.status === 'completed' ? <Check className="w-3.5 h-3.5" /> : 
                             step.status === 'running' ? <div className="w-2 h-2 rounded-full bg-accent-primary animate-ping" /> : 
                             <div className="w-1.5 h-1.5 rounded-full bg-current" />}
                        </div>
                        <span className={cn(
                            "text-sm font-semibold transition-colors duration-300",
                            step.status === 'pending' ? "text-primary-muted/50" : "text-primary"
                        )}>{step.label}</span>
                        
                        {step.status === 'running' && (
                            <motion.span 
                                initial={{ opacity: 0 }} 
                                animate={{ opacity: 1 }} 
                                className="ml-auto text-xs text-accent-primary font-bold tracking-wider"
                            >
                                KJØRER
                            </motion.span>
                        )}
                    </div>
                ))}
            </div>
        </div>
      </Layout>
    );
  }

  // -- RENDER: EVALUATED DASHBOARD --
  const tabs = [
    { id: 'summary', label: 'Sammendrag', content: idea.evaluation_summary },
    { id: 'market', label: 'Marked', content: idea.market_report },
    { id: 'prd', label: 'Produktkrav', content: idea.prd },
    { id: 'risk', label: 'Risiko', content: idea.risk_assessment },
    { id: 'draft', label: 'Orginalt utkast', content: idea.idea_document },
  ];

  return (
    <Layout>
      <motion.div 
        variants={pageVariants}
        initial="initial"
        animate="animate"
        className="max-w-6xl mx-auto space-y-8"
      >
        {/* Top Header */}
        <div className="flex flex-col gap-6">
          <button onClick={() => navigate('/')} className="flex items-center gap-2 text-sm font-medium text-primary-muted hover:text-primary transition-colors w-fit">
               <ArrowLeft className="w-4 h-4" />
               Tilbake til oversikt
          </button>
          
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-border pb-8">
            <div className="space-y-3">
               <div className="flex items-center gap-3">
                 <Badge status={idea.status} />
                 <span className="text-primary-muted text-sm px-2 border-l border-border font-medium">Opprettet {idea.createdAt}</span>
               </div>
               <h1 className="text-4xl font-extrabold text-primary tracking-tight">{idea.title}</h1>
               <p className="text-lg text-primary-muted max-w-2xl leading-relaxed">{idea.description}</p>
            </div>

            {/* Total Score Display */}
            {(idea.scores) && (
                <div className="flex items-center gap-6 bg-white p-5 rounded-2xl border border-border shadow-sm">
                   <div className="flex flex-col">
                        <span className="text-xs font-bold uppercase tracking-wider text-primary-muted mb-1">Total Score</span>
                        <div className="flex items-baseline gap-1">
                            <motion.span 
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2, duration: 0.5 }}
                                className="text-4xl font-extrabold text-primary"
                            >
                                {idea.scores.total}
                            </motion.span>
                            <span className="text-lg text-primary-muted font-bold">/10</span>
                        </div>
                   </div>
                   <div className="h-10 w-px bg-border" />
                   <div className="flex flex-col justify-center">
                        <span className="text-xs font-bold text-primary-muted mb-1">Anbefaling</span>
                        {idea.recommendation === 'go' && <span className="text-success font-bold flex items-center gap-1 uppercase tracking-tight">GÅ VIDERE <Check className="w-4 h-4" /></span>}
                        {idea.recommendation === 'hold' && <span className="text-warning font-bold flex items-center gap-1 uppercase tracking-tight">AVVENT <Clock className="w-4 h-4" /></span>}
                        {idea.recommendation === 'reject' && <span className="text-error font-bold flex items-center gap-1 uppercase tracking-tight">FORKAST <ThumbsDown className="w-4 h-4" /></span>}
                   </div>
                </div>
            )}
          </div>
        </div>

        {/* Score Grid Breakdown */}
        {idea.scores && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <ScoreCard title="Markedspotensial" score={idea.scores.market} icon={<BarChart3 className="w-5 h-5 text-accent-primary" />} delay={0.1} />
                <ScoreCard title="Byggbarhet" score={idea.scores.buildability} icon={<Wrench className="w-5 h-5 text-info" />} delay={0.2} />
                <ScoreCard title="Forretningsmodell" score={idea.scores.business} icon={<Coins className="w-5 h-5 text-success" />} delay={0.3} />
            </div>
        )}

        {/* Main Content Area */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Tabs Sidebar */}
            <div className="lg:col-span-1">
                <nav className="flex lg:flex-col gap-1 overflow-x-auto lg:overflow-visible pb-2 lg:pb-0 sticky top-24">
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={cn(
                                "flex items-center justify-between px-4 py-3 rounded-lg text-sm font-semibold transition-all whitespace-nowrap",
                                activeTab === tab.id 
                                    ? "bg-primary text-white shadow-md" 
                                    : "text-primary-muted hover:text-primary hover:bg-surface-elevated"
                            )}
                        >
                            {tab.label}
                            {activeTab === tab.id && <ChevronRight className="w-4 h-4 opacity-80 hidden lg:block" />}
                        </button>
                    ))}
                </nav>
            </div>

            {/* Document Viewer */}
            <div className="lg:col-span-3 min-h-[600px]">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={activeTab}
                        initial={{ opacity: 0, x: 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -10 }}
                        transition={{ duration: 0.2 }}
                        className="bg-white border border-border rounded-2xl p-8 shadow-sm relative overflow-hidden"
                    >
                        <div className="absolute top-6 right-6 flex gap-2">
                            <button className="p-2 text-primary-muted hover:text-primary hover:bg-surface-elevated rounded-lg transition-colors" title="Kopier">
                                <Copy className="w-4 h-4" />
                            </button>
                            <button className="p-2 text-primary-muted hover:text-primary hover:bg-surface-elevated rounded-lg transition-colors" title="Last ned PDF">
                                <Download className="w-4 h-4" />
                            </button>
                        </div>
                        
                        <div>
                            <ReactMarkdown
                                components={{
                                  p: ({node, children, ...props}) => {
                                    const text = String(children);
                                    if (text.includes('[Trenger avklaring]')) {
                                      return <p className="bg-orange-50 border-l-2 border-orange-300 pl-4 py-3 text-orange-900 text-xs rounded-r-lg font-medium my-2" {...props}>{children}</p>;
                                    }
                                    return <p className="text-primary-muted leading-7 my-3" {...props}>{children}</p>;
                                  },
                                  h1: ({node, ...props}) => <h1 className="text-2xl font-extrabold mb-6 mt-2 text-primary tracking-tight" {...props} />,
                                  h2: ({node, ...props}) => <h2 className="text-lg font-bold mt-8 mb-3 pb-2 border-b border-border text-primary" {...props} />,
                                  h3: ({node, ...props}) => <h3 className="text-base font-bold mt-6 mb-2 text-primary" {...props} />,
                                  ul: ({node, ...props}) => <ul className="my-3 space-y-1.5 ml-4" {...props} />,
                                  ol: ({node, ...props}) => <ol className="my-3 space-y-1.5 ml-4 list-decimal" {...props} />,
                                  li: ({node, ...props}) => <li className="text-primary-muted text-sm leading-6" {...props} />,
                                  strong: ({node, ...props}) => <strong className="font-bold text-primary" {...props} />,
                                  em: ({node, ...props}) => <em className="italic text-primary" {...props} />,
                                  code: ({node, inline, ...props}) =>
                                    inline ?
                                      <code className="bg-surface-elevated px-1.5 py-0.5 rounded text-xs text-accent-primary font-mono border border-border" {...props} /> :
                                      <code className="block bg-surface-elevated p-3 rounded-lg text-xs text-primary font-mono border border-border my-3 overflow-x-auto" {...props} />,
                                  blockquote: ({node, ...props}) => <blockquote className="border-l-2 border-accent-primary bg-accent-subtle pl-4 py-2 my-3 rounded-r text-primary italic" {...props} />,
                                }}
                            >
                                {tabs.find(t => t.id === activeTab)?.content || '_Ingen data tilgjengelig_'}
                            </ReactMarkdown>
                        </div>
                    </motion.div>
                </AnimatePresence>
                
                {/* Action Footer */}
                {idea.status === 'evaluated' && (
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                        className="mt-8 p-6 rounded-2xl border border-border bg-white shadow-sm flex flex-col md:flex-row items-center justify-between gap-6"
                    >
                        <div>
                            <h3 className="text-lg font-bold text-primary">Ta en beslutning</h3>
                            <p className="text-sm text-primary-muted">Velg handling for å flytte prosessen videre.</p>
                        </div>
                        <div className="flex gap-3 w-full md:w-auto">
                             <button
                                onClick={() => handleDecision('go', 'Besluttet å gå videre med idéen basert på evaluering')}
                                className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-2.5 bg-accent-primary hover:bg-orange-600 text-white rounded-lg font-bold shadow-md hover:shadow-lg transition-all"
                             >
                                 <ThumbsUp className="w-4 h-4" /> Gå videre
                             </button>
                             <button
                                onClick={() => handleDecision('hold', 'Besluttet å avvente idéen for videre vurdering')}
                                className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-2.5 bg-white border border-border hover:bg-surface-elevated text-primary rounded-lg font-bold transition-colors shadow-sm"
                             >
                                 <Clock className="w-4 h-4" /> Avvent
                             </button>
                             <button
                                onClick={() => handleDecision('reject', 'Besluttet å forkaste idéen basert på evaluering')}
                                className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-2.5 bg-white border border-red-100 hover:bg-red-50 text-error hover:border-red-200 rounded-lg font-bold transition-colors shadow-sm"
                             >
                                 <ThumbsDown className="w-4 h-4" /> Forkast
                             </button>
                        </div>
                    </motion.div>
                )}
            </div>
        </div>
      </motion.div>
    </Layout>
  );
};

const ScoreCard = ({ title, score, icon, delay }: { title: string, score: number, icon: React.ReactNode, delay: number }) => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.4 }}
    className="bg-white border border-border rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow group"
  >
    <div className="flex items-center gap-3 mb-4">
      <div className="w-10 h-10 rounded-lg bg-surface-elevated border border-border flex items-center justify-center shadow-sm">
        {icon}
      </div>
      <span className="font-semibold text-primary-muted group-hover:text-primary transition-colors">{title}</span>
    </div>
    
    <div className="space-y-2">
        <div className="flex items-baseline justify-between">
            <span className="text-2xl font-extrabold text-primary">{score}</span>
            <span className="text-xs text-primary-muted font-medium">/10</span>
        </div>
        <div className="h-1.5 w-full bg-surface-elevated rounded-full overflow-hidden">
            <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${score * 10}%` }}
                transition={{ duration: 1, delay: delay + 0.2, ease: "easeOut" }}
                className={cn(
                    "h-full rounded-full",
                    score >= 8 ? "bg-success" :
                    score >= 6 ? "bg-warning" :
                    "bg-error"
                )}
            />
        </div>
    </div>
  </motion.div>
);