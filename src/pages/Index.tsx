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
const API_UPLOAD = 'https://functions.poehali.dev/933abfe9-deb8-495b-85ca-536ad38d4199';
const API_UPLOAD_S3 = 'https://functions.poehali.dev/92d247cf-0040-4dac-b2de-ac96de389848';

const Index = () => {
  const [activeSection, setActiveSection] = useState('home');
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [articles, setArticles] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showAddArticle, setShowAddArticle] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [extractedText, setExtractedText] = useState('');
  const [extractedHtml, setExtractedHtml] = useState('');
  const [extractedImages, setExtractedImages] = useState<string[]>([]);
  const [selectedArticle, setSelectedArticle] = useState<any>(null);
  const [uploadedFileUrl, setUploadedFileUrl] = useState('');

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

  const handleDeleteArticle = async (articleId: number) => {
    if (!confirm('Вы уверены, что хотите удалить эту статью?')) return;

    setLoading(true);
    try {
      const response = await fetch(`${API_ARTICLES}?id=${articleId}`, {
        method: 'DELETE'
      });
      const data = await response.json();
      if (data.success) {
        setArticles(articles.filter(a => a.id !== articleId));
        if (selectedArticle?.id === articleId) {
          setSelectedArticle(null);
        }
      }
    } catch (error) {
      console.error('Ошибка удаления статьи:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteMaterial = async (materialId: number) => {
    if (!confirm('Вы уверены, что хотите удалить этот материал?')) return;

    setLoading(true);
    try {
      const response = await fetch(`${API_MATERIALS}?id=${materialId}`, {
        method: 'DELETE'
      });
      const data = await response.json();
      if (data.success) {
        setMaterials(materials.filter(m => m.id !== materialId));
      }
    } catch (error) {
      console.error('Ошибка удаления материала:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowedTypes = ['.txt', '.rtf', '.docx', '.doc', '.odt', '.pdf'];
    const fileExt = '.' + file.name.split('.').pop()?.toLowerCase();
    
    if (!allowedTypes.includes(fileExt)) {
      alert('Неподдерживаемый формат файла. Разрешены: ' + allowedTypes.join(', '));
      return;
    }

    setSelectedFile(file);
    setLoading(true);

    try {
      const reader = new FileReader();
      reader.onload = async (event) => {
        const base64 = event.target?.result as string;
        const base64Content = base64.split(',')[1];

        const textResponse = await fetch(API_UPLOAD, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            file: base64Content,
            fileName: file.name,
            fileType: fileExt.slice(1)
          })
        });

        const textData = await textResponse.json();
        if (textData.html) {
          setExtractedHtml(textData.html);
          setExtractedText(textData.html.replace(/<[^>]*>/g, ''));
        }
        if (textData.images && textData.images.length > 0) {
          setExtractedImages(textData.images.map((img: any) => img.data));
        }

        const s3Response = await fetch(API_UPLOAD_S3, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            file: base64Content,
            fileName: file.name
          })
        });

        const s3Data = await s3Response.json();
        if (s3Data.url) {
          setUploadedFileUrl(s3Data.url);
        }
        
        setLoading(false);
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Ошибка загрузки файла:', error);
      setLoading(false);
    }
  };

  const handleAddArticle = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const title = formData.get('title') as string;
    const excerpt = formData.get('excerpt') as string;
    let content = formData.get('content') as string;
    const author = formData.get('author') as string;
    const category = formData.get('category') as string;

    if (extractedHtml) {
      content = extractedHtml;
    } else if (extractedText) {
      content = extractedText;
    }

    if (!title.trim()) return;

    setLoading(true);
    try {
      const response = await fetch(API_ARTICLES, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title,
          excerpt,
          content,
          author,
          category,
          file_url: uploadedFileUrl,
          file_name: selectedFile?.name,
          file_type: selectedFile?.name.split('.').pop()
        })
      });
      const data = await response.json();
      if (data.article) {
        setArticles([data.article, ...articles]);
        e.currentTarget.reset();
        setShowAddArticle(false);
        setSelectedFile(null);
        setExtractedText('');
        setExtractedHtml('');
        setExtractedImages([]);
        setUploadedFileUrl('');
      }
    } catch (error) {
      console.error('Ошибка добавления статьи:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadArticleDetails = async (articleId: number) => {
    try {
      const response = await fetch(`${API_ARTICLES}?id=${articleId}`);
      const data = await response.json();
      if (data.article) {
        setSelectedArticle(data.article);
      }
    } catch (error) {
      console.error('Ошибка загрузки статьи:', error);
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
            </div>
          </div>
        )}
      </nav>

      <main className="container mx-auto px-4 py-12">
        {activeSection === 'home' && (
          <div className="space-y-16 animate-fade-in">
            <section className="text-center max-w-4xl mx-auto space-y-6">
              <h2 className="text-5xl md:text-6xl font-bold leading-tight bg-gradient-to-r from-primary via-secondary to-primary bg-clip-text text-transparent">
                Обучай через ассоциации
              </h2>
              <div className="space-y-8 max-w-4xl mx-auto text-left">
                <div className="text-center space-y-4">
                  <h3 className="text-3xl font-bold text-foreground">
                    🌉 Ассоциативная методика: Превращаем урок в диалог миров
                  </h3>
                  <p className="text-xl italic text-muted-foreground">
                    Что, если ключ к пониманию лежит не в заучивании, а в связи идей?
                  </p>
                </div>

                <p className="text-lg text-muted-foreground leading-relaxed">
                  Приветствуем на форуме молодых педагогов-новаторов! Это пространство для тех, кто не боится выйти за рамки традиционного урока и открыть для себя силу ассоциативной методики.
                </p>

                <Card className="border-2 shadow-lg bg-gradient-to-br from-primary/5 to-secondary/5">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-2xl">
                      <Icon name="Lightbulb" size={28} className="text-primary" />
                      Что это такое?
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-base leading-relaxed">
                      <strong>Ассоциативная методика</strong> — это педагогический подход, который использует естественные для человеческого мышления связи — ассоциации — для создания глубокого, эмоционально окрашенного и прочного понимания материала. Это не просто техника, а философия преподавания, где:
                    </p>
                    <div className="space-y-3 pl-4 border-l-4 border-primary">
                      <div className="flex items-start gap-3">
                        <span className="text-2xl">💬</span>
                        <p className="text-base">Урок становится живым диалогом, а не монологом.</p>
                      </div>
                      <div className="flex items-start gap-3">
                        <span className="text-2xl">⚓</span>
                        <p className="text-base">Сложные понятия находят свои «якоря» в личном опыте ученика.</p>
                      </div>
                      <div className="flex items-start gap-3">
                        <span className="text-2xl">🕸️</span>
                        <p className="text-base">Знания связываются в прочную сеть, а не хранятся разрозненными фактами.</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-2 shadow-lg bg-gradient-to-br from-secondary/5 to-primary/5">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-2xl">
                      <Icon name="Sparkles" size={28} className="text-secondary" />
                      Почему это работает сегодня?
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-base leading-relaxed">
                      Современные дети мыслят клипами, образами, переходами. Ассоциативная методика говорит с ними на их языке. Она помогает:
                    </p>
                    <div className="grid gap-3">
                      <div className="flex items-start gap-3 p-3 rounded-lg bg-background/50">
                        <Icon name="Heart" size={20} className="text-primary mt-1 flex-shrink-0" />
                        <p className="text-base">Пробудить интерес через личные связи с предметом.</p>
                      </div>
                      <div className="flex items-start gap-3 p-3 rounded-lg bg-background/50">
                        <Icon name="Brain" size={20} className="text-secondary mt-1 flex-shrink-0" />
                        <p className="text-base">Развить критическое и творческое мышление, находя неочевидные параллели.</p>
                      </div>
                      <div className="flex items-start gap-3 p-3 rounded-lg bg-background/50">
                        <Icon name="Target" size={20} className="text-primary mt-1 flex-shrink-0" />
                        <p className="text-base">Сделать знания практичными и применимыми в жизни.</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-2 shadow-lg border-primary">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-2xl">
                      <Icon name="Users" size={28} className="text-primary" />
                      Этот форум — ваш ресурс для роста
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 font-semibold text-primary">
                          <Icon name="Share2" size={20} />
                          <span>Обменивайтесь находками</span>
                        </div>
                        <p className="text-sm text-muted-foreground pl-7">
                          Поделитесь, как вы связали квантовую физику с музыкой или грамматику с архитектурой.
                        </p>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 font-semibold text-secondary">
                          <Icon name="Eye" size={20} />
                          <span>Ищите вдохновение</span>
                        </div>
                        <p className="text-sm text-muted-foreground pl-7">
                          Узнайте, какие ассоциативные ходы используют ваши коллеги.
                        </p>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 font-semibold text-primary">
                          <Icon name="HandHeart" size={20} />
                          <span>Получайте поддержку</span>
                        </div>
                        <p className="text-sm text-muted-foreground pl-7">
                          Обсуждайте сложности и вместе находите нестандартные решения.
                        </p>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 font-semibold text-secondary">
                          <Icon name="Rocket" size={20} />
                          <span>Развивайтесь вместе</span>
                        </div>
                        <p className="text-sm text-muted-foreground pl-7">
                          Мы верим, что лучшие ассоциации рождаются в сотрудничестве.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <div className="text-center space-y-4 pt-4">
                  <p className="text-lg font-medium text-foreground">
                    Давайте вместе создавать уроки, которые не забываются после звонка. <br />
                    <span className="text-primary font-bold">Уроки, которые вдохновляют.</span>
                  </p>
                  <div className="inline-block p-6 rounded-2xl bg-gradient-to-r from-primary/10 via-secondary/10 to-primary/10 border-2 border-primary/20">
                    <p className="text-xl font-semibold text-foreground mb-2">
                      🎯 Присоединяйтесь к обсуждению!
                    </p>
                    <p className="text-base text-muted-foreground">
                      Ваша идея может стать той самой ассоциацией, которая перевернет чей-то урок.
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex gap-4 justify-center pt-4">
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-primary to-secondary hover:opacity-90 transition-opacity text-lg px-8"
                  onClick={() => setActiveSection('articles')}
                >
                  <Icon name="BookOpen" size={20} className="mr-2" />
                  Читать статьи
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="text-lg px-8 border-2 hover:bg-muted"
                  onClick={() => setActiveSection('library')}
                >
                  <Icon name="FolderOpen" size={20} className="mr-2" />
                  Копилка материалов
                </Button>
              </div>
            </section>

            <section className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
              <Card className="border-2 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 animate-scale-in">
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

              <Card className="border-2 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 animate-scale-in" style={{ animationDelay: '0.1s' }}>
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

        {activeSection === 'articles' && (
          <div className="max-w-5xl mx-auto animate-fade-in">
            <div className="mb-8 flex items-center justify-between">
              <div>
                <h2 className="text-4xl font-bold mb-2">Библиотека статей</h2>
                <p className="text-muted-foreground text-lg">Изучайте ассоциативную методику на практике</p>
              </div>
              <Button 
                onClick={() => setShowAddArticle(!showAddArticle)}
                className="bg-gradient-to-r from-primary to-secondary hover:opacity-90 transition-opacity"
              >
                <Icon name="Plus" size={20} className="mr-2" />
                Добавить статью
              </Button>
            </div>

            {showAddArticle && (
              <Card className="border-2 shadow-lg mb-6 animate-fade-in">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Icon name="FileEdit" size={24} />
                    Новая статья
                  </CardTitle>
                  <CardDescription>Поделитесь своими знаниями о методике</CardDescription>
                </CardHeader>
                <CardContent>
                  <form className="space-y-4" onSubmit={handleAddArticle}>
                    <div>
                      <label className="text-sm font-medium mb-2 block">Название статьи</label>
                      <Input name="title" placeholder="Введите название..." required />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-2 block">Краткое описание</label>
                      <Textarea name="excerpt" placeholder="Опишите кратко содержание статьи..." rows={2} required />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-2 block">Загрузить файл статьи</label>
                      <div className="space-y-2">
                        <Input 
                          type="file" 
                          accept=".txt,.rtf,.docx,.doc,.odt,.pdf"
                          onChange={handleFileUpload}
                          disabled={loading}
                        />
                        <p className="text-xs text-muted-foreground">
                          Поддерживаемые форматы: .txt, .rtf, .docx, .doc, .odt, .pdf
                        </p>
                        {selectedFile && (
                          <div className="space-y-2">
                            <div className="flex items-center gap-2 text-sm text-primary">
                              <Icon name="FileCheck" size={16} />
                              <span>Загружен: {selectedFile.name}</span>
                            </div>
                            {extractedImages.length > 0 && (
                              <div className="mt-4">
                                <p className="text-sm font-medium mb-2">Найдено изображений: {extractedImages.length}</p>
                                <div className="grid grid-cols-2 gap-2">
                                  {extractedImages.slice(0, 4).map((img, idx) => (
                                    <img 
                                      key={idx} 
                                      src={img} 
                                      alt={`Изображение ${idx + 1}`}
                                      className="w-full h-32 object-cover rounded border"
                                    />
                                  ))}
                                </div>
                                {extractedImages.length > 4 && (
                                  <p className="text-xs text-muted-foreground mt-2">
                                    И ещё {extractedImages.length - 4} изображений...
                                  </p>
                                )}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-2 block">Или введите текст вручную</label>
                      <Textarea 
                        name="content" 
                        placeholder="Напишите полный текст статьи..." 
                        rows={6}
                        value={extractedHtml || extractedText}
                        onChange={(e) => {
                          setExtractedText(e.target.value);
                          setExtractedHtml('');
                        }}
                      />
                      {extractedHtml && (
                        <p className="text-xs text-muted-foreground mt-2">
                          ℹ️ Обнаружены таблицы и форматирование из файла. Редактирование вручную отключит форматирование.
                        </p>
                      )}
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium mb-2 block">Автор</label>
                        <Input name="author" placeholder="Ваше имя" required />
                      </div>
                      <div>
                        <label className="text-sm font-medium mb-2 block">Категория</label>
                        <select name="category" className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" required>
                          <option value="Теория">Теория</option>
                          <option value="Практика">Практика</option>
                          <option value="Методика">Методика</option>
                        </select>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button type="submit" disabled={loading} className="flex-1 bg-gradient-to-r from-primary to-secondary hover:opacity-90 transition-opacity">
                        <Icon name="Send" size={20} className="mr-2" />
                        Опубликовать
                      </Button>
                      <Button type="button" variant="outline" onClick={() => setShowAddArticle(false)}>
                        Отмена
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            )}

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
                        <div className="flex items-center gap-2">
                          <Button 
                            variant="outline" 
                            className="hover:bg-primary hover:text-white transition-colors"
                            onClick={() => loadArticleDetails(article.id)}
                          >
                            Читать
                            <Icon name="ArrowRight" size={16} className="ml-2" />
                          </Button>
                          <Button
                            variant="outline"
                            size="icon"
                            className="hover:bg-destructive hover:text-white transition-colors"
                            onClick={() => handleDeleteArticle(article.id)}
                          >
                            <Icon name="Trash2" size={16} />
                          </Button>
                        </div>
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
                          <div className="flex flex-col gap-2">
                            <Button size="sm" className="bg-gradient-to-r from-primary to-secondary flex-shrink-0">
                              <Icon name="Download" size={16} />
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline"
                              className="hover:bg-destructive hover:text-white transition-colors"
                              onClick={() => handleDeleteMaterial(material.id)}
                            >
                              <Icon name="Trash2" size={16} />
                            </Button>
                          </div>
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

        {selectedArticle && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
            <Card className="max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-2xl">
              <CardHeader className="border-b bg-gradient-to-r from-primary/10 to-secondary/10">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <Badge className="bg-secondary text-white mb-2">{selectedArticle.category}</Badge>
                    <CardTitle className="text-3xl mb-2">{selectedArticle.title}</CardTitle>
                    <CardDescription className="text-base">{selectedArticle.excerpt}</CardDescription>
                    <div className="flex items-center gap-4 mt-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <Icon name="User" size={16} />
                        <span>{selectedArticle.author}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Icon name="Calendar" size={16} />
                        <span>{selectedArticle.date}</span>
                      </div>
                      {selectedArticle.file_name && selectedArticle.file_url && (
                        <a 
                          href={selectedArticle.file_url} 
                          download={selectedArticle.file_name}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 text-primary hover:text-primary/80 transition-colors"
                        >
                          <Icon name="Download" size={16} />
                          <span>Скачать {selectedArticle.file_name}</span>
                        </a>
                      )}
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setSelectedArticle(null)}
                    className="flex-shrink-0"
                  >
                    <Icon name="X" size={24} />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <ScrollArea className="h-[60vh] p-6">
                  <div 
                    className="prose prose-lg max-w-none"
                    dangerouslySetInnerHTML={{ __html: selectedArticle.content }}
                    style={{
                      lineHeight: '1.8',
                      fontSize: '16px'
                    }}
                  />
                </ScrollArea>
              </CardContent>
            </Card>
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