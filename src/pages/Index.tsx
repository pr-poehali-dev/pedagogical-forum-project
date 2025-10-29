import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import Icon from '@/components/ui/icon';

const API_MESSAGES = 'https://functions.poehali.dev/5eb477db-2802-4fa6-9703-300096613c44';
const API_MATERIALS = 'https://functions.poehali.dev/bd58dfc4-9022-40ad-94a2-4a3d44169533';
const API_ARTICLES = 'https://functions.poehali.dev/f3b57684-2e77-461c-b758-e052ad2bee51';

const Index = () => {
  const [activeSection, setActiveSection] = useState('home');
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [articles, setArticles] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    loadMessages();
    loadArticles();
    loadMaterials();
  }, []);

  const loadMessages = async () => {
    try {
      const response = await fetch(API_MESSAGES);
      const data = await response.json();
      setMessages(data.messages || []);
    } catch (error) {
      console.error('Ошибка загрузки сообщений:', error);
    }
  };

  const loadArticles = async () => {
    try {
      const response = await fetch(API_ARTICLES);
      const data = await response.json();
      setArticles(data.articles || []);
    } catch (error) {
      console.error('Ошибка загрузки статей:', error);
    }
  };

  const loadMaterials = async () => {
    try {
      const response = await fetch(API_MATERIALS);
      const data = await response.json();
      setMaterials(data.materials || []);
    } catch (error) {
      console.error('Ошибка загрузки материалов:', error);
    }
  };

  const handleSendMessage = async () => {
    if (newMessage.trim()) {
      setLoading(true);
      try {
        const response = await fetch(API_MESSAGES, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            author: 'Вы',
            text: newMessage
          })
        });
        const data = await response.json();
        if (data.message) {
          setMessages([...messages, data.message]);
          setNewMessage('');
        }
      } catch (error) {
        console.error('Ошибка отправки сообщения:', error);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleAddMaterial = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const title = formData.get('title') as string;
    const description = formData.get('description') as string;
    const category = formData.get('category') as string;

    if (!title.trim()) return;

    setLoading(true);
    try {
      const response = await fetch(API_MATERIALS, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title,
          description,
          author: 'Вы',
          file_type: 'PDF',
          category
        })
      });
      const data = await response.json();
      if (data.material) {
        setMaterials([data.material, ...materials]);
        e.currentTarget.reset();
      }
    } catch (error) {
      console.error('Ошибка добавления материала:', error);
    } finally {
      setLoading(false);
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
            <div className="flex items-center gap-4">
              <Button className="hidden md:flex bg-gradient-to-r from-primary to-secondary hover:opacity-90 transition-opacity">
                Войти
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                <Icon name={mobileMenuOpen ? 'X' : 'Menu'} size={24} />
              </Button>
            </div>
          </div>
        </div>
        {mobileMenuOpen && (
          <div className="md:hidden border-t bg-white animate-fade-in">
            <div className="container mx-auto px-4 py-4 flex flex-col gap-2">
              <button
                onClick={() => {
                  setActiveSection('home');
                  setMobileMenuOpen(false);
                }}
                className={`w-full text-left px-4 py-3 rounded-lg font-medium transition-colors ${
                  activeSection === 'home' 
                    ? 'bg-gradient-to-r from-primary to-secondary text-white' 
                    : 'text-muted-foreground hover:bg-muted'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon name="Home" size={20} />
                  <span>Главная</span>
                </div>
              </button>
              <button
                onClick={() => {
                  setActiveSection('discussions');
                  setMobileMenuOpen(false);
                }}
                className={`w-full text-left px-4 py-3 rounded-lg font-medium transition-colors ${
                  activeSection === 'discussions' 
                    ? 'bg-gradient-to-r from-primary to-secondary text-white' 
                    : 'text-muted-foreground hover:bg-muted'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon name="MessageCircle" size={20} />
                  <span>Обсуждения</span>
                </div>
              </button>
              <button
                onClick={() => {
                  setActiveSection('articles');
                  setMobileMenuOpen(false);
                }}
                className={`w-full text-left px-4 py-3 rounded-lg font-medium transition-colors ${
                  activeSection === 'articles' 
                    ? 'bg-gradient-to-r from-primary to-secondary text-white' 
                    : 'text-muted-foreground hover:bg-muted'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon name="BookOpen" size={20} />
                  <span>Статьи</span>
                </div>
              </button>
              <button
                onClick={() => {
                  setActiveSection('library');
                  setMobileMenuOpen(false);
                }}
                className={`w-full text-left px-4 py-3 rounded-lg font-medium transition-colors ${
                  activeSection === 'library' 
                    ? 'bg-gradient-to-r from-primary to-secondary text-white' 
                    : 'text-muted-foreground hover:bg-muted'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon name="FolderOpen" size={20} />
                  <span>Копилка</span>
                </div>
              </button>
              <Button className="w-full bg-gradient-to-r from-primary to-secondary hover:opacity-90 transition-opacity mt-2">
                Войти
              </Button>
            </div>
          </div>
        )}
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
                    <Button onClick={handleSendMessage} disabled={loading} className="bg-gradient-to-r from-primary to-secondary">
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
                  <form className="space-y-4" onSubmit={handleAddMaterial}>
                    <div>
                      <label className="text-sm font-medium mb-2 block">Название материала</label>
                      <Input name="title" placeholder="Введите название..." required />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-2 block">Описание</label>
                      <Textarea name="description" placeholder="Расскажите о вашем материале..." rows={4} />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-2 block">Категория</label>
                      <Input name="category" placeholder="Например: Математика, История..." />
                    </div>
                    <Button type="submit" disabled={loading} className="w-full bg-gradient-to-r from-primary to-secondary hover:opacity-90 transition-opacity" size="lg">
                      <Icon name="Upload" size={20} className="mr-2" />
                      Добавить материал
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
              © 2025 ПедагогикаЛаб. Обучаем через ассоциации
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;