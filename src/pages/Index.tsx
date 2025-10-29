import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import Icon from '@/components/ui/icon';

const Index = () => {
  const [activeSection, setActiveSection] = useState('home');
  const [messages, setMessages] = useState([
    { id: 1, author: 'Анна Петрова', text: 'Использую метод ассоциаций на уроках истории. Дети запоминают даты через образы!', time: '10:30' },
    { id: 2, author: 'Иван Сергеев', text: 'Кто-нибудь пробовал применять мнемотехники для изучения иностранных языков?', time: '11:15' },
    { id: 3, author: 'Мария Козлова', text: 'Отличная идея! У меня есть готовые карточки с ассоциациями, могу поделиться', time: '11:42' }
  ]);
  const [newMessage, setNewMessage] = useState('');

  const articles = [
    {
      id: 1,
      title: 'Основы ассоциативной методики в педагогике',
      excerpt: 'Познакомьтесь с фундаментальными принципами метода ассоциаций и его применением в современном образовании.',
      author: 'Елена Волкова',
      date: '15 октября 2024',
      category: 'Теория'
    },
    {
      id: 2,
      title: 'Мнемотехники для запоминания математических формул',
      excerpt: 'Практические примеры использования образных ассоциаций для изучения точных наук.',
      author: 'Дмитрий Новиков',
      date: '12 октября 2024',
      category: 'Практика'
    },
    {
      id: 3,
      title: 'Игровые методы обучения через ассоциации',
      excerpt: 'Как превратить урок в увлекательное путешествие с помощью ассоциативных игр.',
      author: 'Ольга Смирнова',
      date: '8 октября 2024',
      category: 'Методика'
    }
  ];

  const materials = [
    { id: 1, title: 'Карточки для изучения исторических дат', author: 'Анна П.', type: 'PDF', downloads: 234 },
    { id: 2, title: 'Презентация: Ассоциации в химии', author: 'Иван С.', type: 'PPTX', downloads: 189 },
    { id: 3, title: 'Шаблон урока с мнемотехниками', author: 'Мария К.', type: 'DOCX', downloads: 312 }
  ];

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      setMessages([
        ...messages,
        { id: messages.length + 1, author: 'Вы', text: newMessage, time: new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' }) }
      ]);
      setNewMessage('');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-muted via-background to-accent">
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-border shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                <Icon name="Brain" size={24} className="text-white" />
              </div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                ПедагогикаЛаб
              </h1>
            </div>
            <div className="hidden md:flex gap-6">
              <button
                onClick={() => setActiveSection('home')}
                className={`font-medium transition-colors ${activeSection === 'home' ? 'text-primary' : 'text-muted-foreground hover:text-primary'}`}
              >
                Главная
              </button>
              <button
                onClick={() => setActiveSection('discussions')}
                className={`font-medium transition-colors ${activeSection === 'discussions' ? 'text-primary' : 'text-muted-foreground hover:text-primary'}`}
              >
                Обсуждения
              </button>
              <button
                onClick={() => setActiveSection('articles')}
                className={`font-medium transition-colors ${activeSection === 'articles' ? 'text-primary' : 'text-muted-foreground hover:text-primary'}`}
              >
                Статьи
              </button>
              <button
                onClick={() => setActiveSection('library')}
                className={`font-medium transition-colors ${activeSection === 'library' ? 'text-primary' : 'text-muted-foreground hover:text-primary'}`}
              >
                Копилка
              </button>
            </div>
            <Button className="bg-gradient-to-r from-primary to-secondary hover:opacity-90 transition-opacity">
              Войти
            </Button>
          </div>
        </div>
      </nav>

      <main className="container mx-auto px-4 py-12">
        {activeSection === 'home' && (
          <div className="space-y-16 animate-fade-in">
            <section className="text-center max-w-4xl mx-auto space-y-6">
              <Badge className="bg-secondary text-white px-4 py-2 text-sm">
                Платформа для молодых педагогов
              </Badge>
              <h2 className="text-5xl md:text-6xl font-bold leading-tight bg-gradient-to-r from-primary via-secondary to-primary bg-clip-text text-transparent">
                Обучай через ассоциации
              </h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Присоединяйтесь к сообществу педагогов, которые используют ассоциативную методику для создания незабываемых уроков
              </p>
              <div className="flex gap-4 justify-center pt-4">
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-primary to-secondary hover:opacity-90 transition-opacity text-lg px-8"
                  onClick={() => setActiveSection('discussions')}
                >
                  <Icon name="MessageCircle" size={20} className="mr-2" />
                  Начать общение
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="text-lg px-8 border-2 hover:bg-muted"
                  onClick={() => setActiveSection('articles')}
                >
                  <Icon name="BookOpen" size={20} className="mr-2" />
                  Читать статьи
                </Button>
              </div>
            </section>

            <section className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
              <Card className="border-2 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 animate-scale-in">
                <CardHeader>
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center mb-4">
                    <Icon name="Users" size={24} className="text-white" />
                  </div>
                  <CardTitle className="text-2xl">Обсуждения</CardTitle>
                  <CardDescription className="text-base">
                    Общайтесь с коллегами в реальном времени, делитесь опытом и находите единомышленников
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card className="border-2 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 animate-scale-in" style={{ animationDelay: '0.1s' }}>
                <CardHeader>
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-secondary to-accent flex items-center justify-center mb-4">
                    <Icon name="FileText" size={24} className="text-primary" />
                  </div>
                  <CardTitle className="text-2xl">Статьи</CardTitle>
                  <CardDescription className="text-base">
                    Изучайте теорию и практику ассоциативной методики от опытных педагогов
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card className="border-2 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 animate-scale-in" style={{ animationDelay: '0.2s' }}>
                <CardHeader>
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-accent to-muted flex items-center justify-center mb-4">
                    <Icon name="FolderOpen" size={24} className="text-primary" />
                  </div>
                  <CardTitle className="text-2xl">Копилка</CardTitle>
                  <CardDescription className="text-base">
                    Скачивайте готовые материалы и делитесь своими наработками с сообществом
                  </CardDescription>
                </CardHeader>
              </Card>
            </section>
          </div>
        )}

        {activeSection === 'discussions' && (
          <div className="max-w-5xl mx-auto animate-fade-in">
            <div className="mb-8">
              <h2 className="text-4xl font-bold mb-2">Канал обсуждений</h2>
              <p className="text-muted-foreground text-lg">Общайтесь с коллегами в реальном времени</p>
            </div>
            
            <Card className="border-2 shadow-xl">
              <CardHeader className="bg-gradient-to-r from-muted to-accent/50 border-b">
                <CardTitle className="flex items-center gap-2">
                  <Icon name="MessageSquare" size={24} />
                  Общий чат
                  <Badge variant="secondary" className="ml-auto">
                    {messages.length} сообщений
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <ScrollArea className="h-[400px] p-6">
                  <div className="space-y-4">
                    {messages.map((msg) => (
                      <div key={msg.id} className="flex gap-3 animate-fade-in">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center flex-shrink-0">
                          <Icon name="User" size={20} className="text-white" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-semibold text-primary">{msg.author}</span>
                            <span className="text-xs text-muted-foreground">{msg.time}</span>
                          </div>
                          <p className="text-foreground bg-muted/50 rounded-lg px-4 py-2">{msg.text}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
                <div className="p-4 border-t bg-muted/30">
                  <div className="flex gap-2">
                    <Input
                      placeholder="Напишите сообщение..."
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                      className="flex-1"
                    />
                    <Button onClick={handleSendMessage} className="bg-gradient-to-r from-primary to-secondary">
                      <Icon name="Send" size={20} />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {activeSection === 'articles' && (
          <div className="max-w-5xl mx-auto animate-fade-in">
            <div className="mb-8">
              <h2 className="text-4xl font-bold mb-2">Библиотека статей</h2>
              <p className="text-muted-foreground text-lg">Изучайте ассоциативную методику на практике</p>
            </div>

            <Tabs defaultValue="all" className="w-full">
              <TabsList className="grid w-full max-w-md grid-cols-4 mb-8">
                <TabsTrigger value="all">Все</TabsTrigger>
                <TabsTrigger value="theory">Теория</TabsTrigger>
                <TabsTrigger value="practice">Практика</TabsTrigger>
                <TabsTrigger value="methods">Методика</TabsTrigger>
              </TabsList>

              <TabsContent value="all" className="space-y-6">
                {articles.map((article, idx) => (
                  <Card key={article.id} className="border-2 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 animate-fade-in" style={{ animationDelay: `${idx * 0.1}s` }}>
                    <CardHeader>
                      <div className="flex items-start justify-between mb-2">
                        <Badge className="bg-secondary text-white">{article.category}</Badge>
                        <span className="text-sm text-muted-foreground">{article.date}</span>
                      </div>
                      <CardTitle className="text-2xl mb-2 hover:text-primary transition-colors cursor-pointer">
                        {article.title}
                      </CardTitle>
                      <CardDescription className="text-base mb-4">
                        {article.excerpt}
                      </CardDescription>
                      <div className="flex items-center justify-between pt-4 border-t">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                            <Icon name="User" size={16} className="text-white" />
                          </div>
                          <span className="text-sm font-medium">{article.author}</span>
                        </div>
                        <Button variant="outline" className="hover:bg-primary hover:text-white transition-colors">
                          Читать
                          <Icon name="ArrowRight" size={16} className="ml-2" />
                        </Button>
                      </div>
                    </CardHeader>
                  </Card>
                ))}
              </TabsContent>
            </Tabs>
          </div>
        )}

        {activeSection === 'library' && (
          <div className="max-w-5xl mx-auto animate-fade-in">
            <div className="mb-8">
              <h2 className="text-4xl font-bold mb-2">Методическая копилка</h2>
              <p className="text-muted-foreground text-lg">Скачивайте материалы и делитесь своими</p>
            </div>

            <div className="grid md:grid-cols-2 gap-6 mb-8">
              <Card className="border-2 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Icon name="Download" size={24} />
                    Доступные материалы
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[400px]">
                    <div className="space-y-4">
                      {materials.map((material) => (
                        <div key={material.id} className="flex items-start gap-3 p-4 rounded-lg border hover:shadow-md transition-all hover:border-primary">
                          <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center flex-shrink-0">
                            <Icon name="FileText" size={24} className="text-white" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold mb-1 text-primary">{material.title}</h4>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                              <Icon name="User" size={14} />
                              <span>{material.author}</span>
                              <span>•</span>
                              <Badge variant="outline" className="text-xs">{material.type}</Badge>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Icon name="Download" size={14} />
                              <span>{material.downloads} скачиваний</span>
                            </div>
                          </div>
                          <Button size="sm" className="bg-gradient-to-r from-primary to-secondary flex-shrink-0">
                            <Icon name="Download" size={16} />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>

              <Card className="border-2 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Icon name="Upload" size={24} />
                    Добавить материал
                  </CardTitle>
                  <CardDescription>Поделитесь своими наработками с коллегами</CardDescription>
                </CardHeader>
                <CardContent>
                  <form className="space-y-4">
                    <div>
                      <label className="text-sm font-medium mb-2 block">Название материала</label>
                      <Input placeholder="Введите название..." />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-2 block">Описание</label>
                      <Textarea placeholder="Расскажите о вашем материале..." rows={4} />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-2 block">Категория</label>
                      <Input placeholder="Например: Математика, История..." />
                    </div>
                    <Button className="w-full bg-gradient-to-r from-primary to-secondary hover:opacity-90 transition-opacity" size="lg">
                      <Icon name="Upload" size={20} className="mr-2" />
                      Загрузить файл
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </main>

      <footer className="bg-primary/5 border-t mt-16">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                <Icon name="Brain" size={24} className="text-white" />
              </div>
              <div>
                <h3 className="font-bold text-lg">ПедагогикаЛаб</h3>
                <p className="text-sm text-muted-foreground">Платформа для молодых педагогов</p>
              </div>
            </div>
            <div className="text-center text-sm text-muted-foreground">
              © 2024 ПедагогикаЛаб. Обучаем через ассоциации
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
