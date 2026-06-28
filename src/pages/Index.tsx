import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';

const API_URL = 'https://functions.poehali.dev/398d07eb-b610-46f4-a39a-f247e5cb8955';
const ABOUT_IMG = 'https://cdn.poehali.dev/projects/d8e2ad7a-9c64-4775-9696-29aedd56f4c1/files/04b8cd2f-3d12-4904-9e1b-055d339cf633.jpg';

interface Review {
  id: number;
  name: string;
  text: string;
  date: string;
}

const navLinks = [
  { id: 'home', label: 'Главная' },
  { id: 'about', label: 'О нас' },
  { id: 'reviews', label: 'Отзывы' },
  { id: 'contact', label: 'Контакты' },
];

const Index = () => {
  const { toast } = useToast();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [form, setForm] = useState({ name: '', email: '', phone: '', message: '' });
  const [reviewForm, setReviewForm] = useState({ name: '', text: '' });
  const [sending, setSending] = useState(false);

  const loadReviews = async () => {
    try {
      const res = await fetch(`${API_URL}?action=reviews`);
      const data = await res.json();
      setReviews(Array.isArray(data) ? data : []);
    } catch {
      /* ignore */
    }
  };

  useEffect(() => {
    loadReviews();
  }, []);

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  const submitContact = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    try {
      const res = await fetch(`${API_URL}?action=contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      toast({ title: data.message || 'Спасибо за обращение!' });
      setForm({ name: '', email: '', phone: '', message: '' });
    } catch {
      toast({ title: 'Не удалось отправить', variant: 'destructive' });
    } finally {
      setSending(false);
    }
  };

  const submitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewForm.name || !reviewForm.text) return;
    try {
      await fetch(`${API_URL}?action=reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(reviewForm),
      });
      toast({ title: 'Спасибо за отзыв!' });
      setReviewForm({ name: '', text: '' });
      loadReviews();
    } catch {
      toast({ title: 'Не удалось отправить отзыв', variant: 'destructive' });
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground font-sans antialiased">
      {/* Header */}
      <header className="fixed top-0 inset-x-0 z-50 backdrop-blur-md bg-background/70 border-b border-border/60">
        <div className="container mx-auto flex items-center justify-between h-16 px-6">
          <button onClick={() => scrollTo('home')} className="font-display text-2xl tracking-tight">
            Studio<span className="text-accent">.</span>
          </button>
          <nav className="hidden md:flex items-center gap-8 text-sm text-muted-foreground">
            {navLinks.map((l) => (
              <button key={l.id} onClick={() => scrollTo(l.id)} className="hover:text-foreground transition-colors">
                {l.label}
              </button>
            ))}
          </nav>
          <Button onClick={() => scrollTo('contact')} variant="outline" size="sm" className="rounded-full">
            Связаться
          </Button>
        </div>
      </header>

      {/* Hero */}
      <section id="home" className="relative min-h-screen flex items-center pt-16 overflow-hidden">
        <div className="absolute -top-32 -right-32 w-[40rem] h-[40rem] rounded-full bg-accent/5 blur-3xl" />
        <div className="container mx-auto px-6 grid lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-7 animate-fade-up">
            <span className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.25em] text-muted-foreground mb-8">
              <span className="w-8 h-px bg-accent" /> Минимализм во всём
            </span>
            <h1 className="font-display text-5xl sm:text-7xl lg:text-8xl leading-[0.95] tracking-tight">
              Чистые линии.
              <br />
              Тихая <span className="italic text-accent">красота</span>.
            </h1>
            <p className="mt-8 max-w-md text-lg text-muted-foreground leading-relaxed">
              Мы создаём пространство, где каждая деталь на своём месте. Меньше шума — больше смысла.
            </p>
            <div className="mt-10 flex flex-wrap gap-4">
              <Button onClick={() => scrollTo('contact')} size="lg" className="rounded-full px-8">
                Оставить заявку
              </Button>
              <Button onClick={() => scrollTo('about')} variant="ghost" size="lg" className="rounded-full px-8">
                Узнать больше
                <Icon name="ArrowRight" size={18} className="ml-2" />
              </Button>
            </div>
          </div>
          <div className="lg:col-span-5 animate-fade-up" style={{ animationDelay: '0.15s' }}>
            <div className="aspect-[4/5] rounded-3xl overflow-hidden shadow-2xl shadow-black/5">
              <img src={ABOUT_IMG} alt="Studio" className="w-full h-full object-cover" />
            </div>
          </div>
        </div>
      </section>

      {/* About */}
      <section id="about" className="py-28 border-t border-border/60">
        <div className="container mx-auto px-6 grid lg:grid-cols-2 gap-16 items-center">
          <div>
            <span className="text-xs uppercase tracking-[0.25em] text-accent">О нас</span>
            <h2 className="font-display text-4xl sm:text-5xl mt-4 leading-tight">
              Простота — это высшая форма утончённости
            </h2>
            <p className="mt-6 text-muted-foreground leading-relaxed">
              Мы верим, что хороший дизайн не нужно объяснять. Он чувствуется. Наша команда работает на стыке
              эстетики и функциональности, убирая всё лишнее и оставляя только важное.
            </p>
            <div className="mt-10 grid grid-cols-3 gap-6">
              {[
                { n: '120+', t: 'Проектов' },
                { n: '8', t: 'Лет опыта' },
                { n: '98%', t: 'Довольных клиентов' },
              ].map((s) => (
                <div key={s.t}>
                  <div className="font-display text-4xl">{s.n}</div>
                  <div className="text-sm text-muted-foreground mt-1">{s.t}</div>
                </div>
              ))}
            </div>
          </div>
          <div className="grid gap-4">
            {[
              { icon: 'PenTool', t: 'Дизайн', d: 'Выверенная типографика и пространство.' },
              { icon: 'Layers', t: 'Подход', d: 'Минимум элементов — максимум смысла.' },
              { icon: 'Sparkles', t: 'Качество', d: 'Внимание к каждой детали.' },
            ].map((c) => (
              <div key={c.t} className="flex gap-5 p-6 rounded-2xl bg-secondary/60 border border-border/50">
                <div className="shrink-0 w-12 h-12 rounded-xl bg-background flex items-center justify-center">
                  <Icon name={c.icon} size={22} className="text-accent" />
                </div>
                <div>
                  <h3 className="font-medium text-lg">{c.t}</h3>
                  <p className="text-sm text-muted-foreground mt-1">{c.d}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Reviews */}
      <section id="reviews" className="py-28 bg-secondary/40 border-y border-border/60">
        <div className="container mx-auto px-6">
          <div className="text-center max-w-xl mx-auto mb-16">
            <span className="text-xs uppercase tracking-[0.25em] text-accent">Отзывы</span>
            <h2 className="font-display text-4xl sm:text-5xl mt-4">Что говорят клиенты</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {reviews.map((r) => (
              <div key={r.id} className="p-8 rounded-2xl bg-background border border-border/60 flex flex-col">
                <Icon name="Quote" size={28} className="text-accent/40" />
                <p className="mt-4 text-foreground/90 leading-relaxed flex-1">{r.text}</p>
                <div className="mt-6 pt-6 border-t border-border/60 flex items-center justify-between">
                  <span className="font-medium">{r.name}</span>
                  <span className="text-sm text-muted-foreground">{r.date}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Leave review */}
          <form onSubmit={submitReview} className="mt-12 max-w-2xl mx-auto bg-background border border-border/60 rounded-2xl p-8">
            <h3 className="font-display text-2xl mb-6">Оставить отзыв</h3>
            <div className="grid gap-4">
              <Input
                placeholder="Ваше имя"
                value={reviewForm.name}
                onChange={(e) => setReviewForm({ ...reviewForm, name: e.target.value })}
              />
              <Textarea
                placeholder="Ваш отзыв"
                rows={3}
                value={reviewForm.text}
                onChange={(e) => setReviewForm({ ...reviewForm, text: e.target.value })}
              />
              <Button type="submit" className="rounded-full justify-self-start px-8">
                Отправить отзыв
              </Button>
            </div>
          </form>
        </div>
      </section>

      {/* Contact */}
      <section id="contact" className="py-28">
        <div className="container mx-auto px-6 grid lg:grid-cols-2 gap-16">
          <div>
            <span className="text-xs uppercase tracking-[0.25em] text-accent">Контакты</span>
            <h2 className="font-display text-4xl sm:text-5xl mt-4 leading-tight">Давайте начнём разговор</h2>
            <p className="mt-6 text-muted-foreground leading-relaxed max-w-md">
              Оставьте заявку — мы ответим в течение рабочего дня и обсудим вашу задачу.
            </p>
            <div className="mt-10 space-y-4 text-muted-foreground">
              <div className="flex items-center gap-3">
                <Icon name="Mail" size={18} className="text-accent" /> hello@studio.ru
              </div>
              <div className="flex items-center gap-3">
                <Icon name="Phone" size={18} className="text-accent" /> +7 (999) 000-00-00
              </div>
              <div className="flex items-center gap-3">
                <Icon name="MapPin" size={18} className="text-accent" /> Москва, Россия
              </div>
            </div>
          </div>
          <form onSubmit={submitContact} className="bg-secondary/50 border border-border/60 rounded-2xl p-8 grid gap-4">
            <Input
              placeholder="Имя"
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
            <Input
              type="email"
              placeholder="Email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
            <Input
              placeholder="Телефон"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
            />
            <Textarea
              placeholder="Сообщение"
              rows={4}
              value={form.message}
              onChange={(e) => setForm({ ...form, message: e.target.value })}
            />
            <Button type="submit" size="lg" disabled={sending} className="rounded-full">
              {sending ? 'Отправляем…' : 'Отправить заявку'}
            </Button>
          </form>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/60 py-10">
        <div className="container mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <span className="font-display text-xl text-foreground">Studio<span className="text-accent">.</span></span>
          <span>© {new Date().getFullYear()} Studio. Все права защищены.</span>
        </div>
      </footer>
    </div>
  );
};

export default Index;
