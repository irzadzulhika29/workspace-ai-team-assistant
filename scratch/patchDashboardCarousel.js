const fs = require('fs');
let code = fs.readFileSync('fe/src/pages/Dashboard.jsx', 'utf8');

// 1. Add imports
const lucideImports = 'CalendarDays, CheckCircle2, Clock3, LockKeyhole, Mail, RefreshCw, Search, TrendingUp, Sparkles, MessageSquare, Briefcase,';
code = code.replace(/CalendarDays,\s*CheckCircle2,\s*Clock3,\s*LockKeyhole,\s*Mail,\s*RefreshCw,\s*Search,\s*TrendingUp,/, lucideImports);

const newImports = `import {
  Carousel as InterfacesCarousel,
  CarouselContent as InterfacesCarouselContent,
  CarouselItem as InterfacesCarouselItem,
  CarouselNext as InterfacesCarouselNext,
  CarouselPrevious as InterfacesCarouselPrevious,
} from "@/components/ui/interfaces-carousel";
`;
code = code.replace(/(import \{[\s\S]*?\} from "@\/components\/ui";)/, "$1\n" + newImports);

// 2. Add getActionMeta helper
const helper = `
const getActionMeta = (intent) => {
  const meta = {
    prepare_rundown: { icon: <CalendarDays className="h-5 w-5" />, bg: "https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&q=80&w=400" },
    prepare_talking_points: { icon: <MessageSquare className="h-5 w-5" />, bg: "https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&q=80&w=400" },
    follow_up_event: { icon: <Sparkles className="h-5 w-5" />, bg: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&q=80&w=400" },
    enrich_event_notes: { icon: <Briefcase className="h-5 w-5" />, bg: "https://images.unsplash.com/photo-1512314889357-e157c22f938d?auto=format&fit=crop&q=80&w=400" }
  };
  return meta[intent] || { icon: <CheckCircle2 className="h-5 w-5" />, bg: "https://images.unsplash.com/photo-1497215728101-856f4ea42174?auto=format&fit=crop&q=80&w=400" };
};
`;
code = code.replace(/(const DONE_STATUS_KEYWORDS)/, helper + '\n$1');

// 3. Replace Aksi Rekomendasi
const oldRecommended = `{activeAgenda ? (
                  <div className="rounded-[1.5rem] border border-dashed border-primary-200/80 p-2">
                    <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                      {/* <div>
                        <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-primary-500/80">
                          Aksi Rekomendasi
                        </p>
                        <p className="mt-1 text-sm font-semibold text-neutral-900">
                          {activeAgenda.summary || "Agenda terpilih"}
                        </p>
                        <p className="mt-1 text-xs text-neutral-500">
                          Aksi ini berubah mengikuti agenda yang sedang aktif di carousel.
                        </p>
                      </div> */}
                      <div className="flex flex-wrap gap-2">
                        {activeAgendaActions.map((action, index) => (
                          <Button
                            key={\`\${action.intent || action.label || "agenda"}-\${index}\`}
                            variant={ "outline"}
                            className="rounded-full"
                            onClick={() =>
                              navigate(
                                "/chat/supervisor",
                                {
                                  state: withNewSupervisorSession(
                                    createAgendaActionState(
                                    action,
                                    activeAgenda,
                                    calendarBriefing,
                                  ),
                                  ),
                                },
                              )
                            }
                          >
                            {action.label || "Buka Supervisor"}
                          </Button>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : null}`;

const newRecommended = `{activeAgenda ? (
                  <div className="mt-4">
                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-3 ml-1">Aksi Rekomendasi</p>
                    <InterfacesCarousel orientation="horizontal" className="w-full">
                      <InterfacesCarouselContent className="h-auto">
                        {activeAgendaActions.map((action, index) => {
                          const meta = getActionMeta(action.intent);
                          return (
                            <InterfacesCarouselItem key={\`\${action.intent || action.label || "agenda"}-\${index}\`} className="basis-3/4 sm:basis-1/2">
                              <div
                                onClick={() => navigate("/chat/supervisor", { state: withNewSupervisorSession(createAgendaActionState(action, activeAgenda, calendarBriefing)) })}
                                className="bg-card text-card-foreground flex flex-col rounded-xl border shadow-sm cursor-pointer overflow-hidden group h-32 relative"
                                style={{ backgroundImage: \`url(\${meta.bg})\`, backgroundSize: 'cover', backgroundPosition: 'center' }}
                              >
                                <div className="absolute inset-0 bg-black/50 group-hover:bg-black/30 transition-colors" />
                                <div className="absolute bottom-3 left-3 right-3 flex items-center gap-2 text-white">
                                  <div className="h-8 w-8 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center">
                                    {meta.icon}
                                  </div>
                                  <span className="font-semibold text-sm line-clamp-2 drop-shadow-md">{action.label || "Buka Supervisor"}</span>
                                </div>
                              </div>
                            </InterfacesCarouselItem>
                          );
                        })}
                      </InterfacesCarouselContent>
                    </InterfacesCarousel>
                  </div>
                ) : null}`;

code = code.replace(oldRecommended, newRecommended);

fs.writeFileSync('fe/src/pages/Dashboard.jsx', code, 'utf8');
console.log('Patched Dashboard.jsx');
