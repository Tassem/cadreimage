import { useState, useRef, ChangeEvent } from "react";
import html2canvas from "html2canvas";
import { Download, Upload, Image as ImageIcon, Type, LayoutTemplate, Palette, Settings2, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

// Size configurations
const SIZES = {
  "1:1": { preview: { w: 480, h: 480 }, download: { w: 1080, h: 1080 }, label: "مربع 1:1" },
  "16:9": { preview: { w: 854, h: 480 }, download: { w: 1920, h: 1080 }, label: "فيديو/يوتيوب 16:9" },
  "9:16": { preview: { w: 270, h: 480 }, download: { w: 1080, h: 1920 }, label: "ستوري/ريلز 9:16" },
  "4:5": { preview: { w: 384, h: 480 }, download: { w: 1080, h: 1350 }, label: "انستغرام 4:5" }
};

type AspectRatio = keyof typeof SIZES;

export default function Home() {
  // State
  const [title, setTitle] = useState("عاجل | تطورات جديدة في الأسواق العالمية مع بداية الربع الأخير");
  const [subtitle, setSubtitle] = useState("خبراء يتوقعون استمرار التقلبات وسط مؤشرات متباينة");
  const [label, setLabel] = useState("اقتصاد");
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>("1:1");
  const [bgImage, setBgImage] = useState<string | null>(null);
  const [logoImage, setLogoImage] = useState<string | null>(null);
  const [bannerColor, setBannerColor] = useState("#c0392b");
  const [textColor, setTextColor] = useState("#ffffff");
  const [labelColor, setLabelColor] = useState("#ffffff");
  const [fontFamily, setFontFamily] = useState("Cairo");
  const [fontSize, setFontSize] = useState(42);
  const [fontWeight, setFontWeight] = useState("700");
  const [photoHeight, setPhotoHeight] = useState(60);
  const [logoPosition, setLogoPosition] = useState("top-right");
  const [invertLogo, setInvertLogo] = useState(false);
  const [textShadow, setTextShadow] = useState(true);
  const [isExporting, setIsExporting] = useState(false);

  const previewRef = useRef<HTMLDivElement>(null);
  const bgInputRef = useRef<HTMLInputElement>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);

  // Handlers
  const handleImageUpload = (e: ChangeEvent<HTMLInputElement>, setter: (url: string) => void) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setter(url);
    }
  };

  const handleDownload = async () => {
    if (!previewRef.current) return;
    setIsExporting(true);

    try {
      const config = SIZES[aspectRatio];
      const scale = config.download.w / config.preview.w;

      const canvas = await html2canvas(previewRef.current, {
        scale: scale,
        useCORS: true,
        allowTaint: true,
        backgroundColor: null,
        width: config.preview.w,
        height: config.preview.h,
      });

      const dataUrl = canvas.toDataURL("image/png", 1.0);
      const link = document.createElement("a");
      link.download = `news-card-${Date.now()}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error("Export failed", err);
    } finally {
      setIsExporting(false);
    }
  };

  // Render Preview
  const renderPreview = () => {
    const config = SIZES[aspectRatio];
    
    return (
      <div className="flex flex-col items-center justify-center w-full h-full bg-slate-950 p-8 overflow-hidden rounded-xl border border-slate-800 shadow-2xl">
        <div className="flex items-center gap-2 mb-6 text-slate-400">
          <Eye size={18} />
          <span className="text-sm font-medium">المعاينة المباشرة ({config.label})</span>
        </div>
        
        <div 
          className="relative bg-white shadow-2xl transition-all duration-300 ease-in-out"
          style={{
            width: `${config.preview.w}px`,
            height: `${config.preview.h}px`,
          }}
        >
          {/* Card Element to Export */}
          <div 
            ref={previewRef}
            className="absolute inset-0 flex flex-col overflow-hidden bg-black"
            dir="rtl"
            style={{ fontFamily: `"${fontFamily}", sans-serif` }}
          >
            {/* Top Photo Area */}
            <div 
              className="relative w-full"
              style={{ height: `${photoHeight}%` }}
            >
              {bgImage ? (
                <img src={bgImage} alt="Background" className="absolute inset-0 w-full h-full object-cover" crossOrigin="anonymous" />
              ) : (
                <div className="absolute inset-0 bg-slate-800 flex flex-col items-center justify-center text-slate-500">
                  <ImageIcon size={48} className="mb-4 opacity-50" />
                  <span>أضف صورة الخلفية</span>
                </div>
              )}
              
              {/* Logo */}
              {logoImage && (
                <div 
                  className={`absolute p-4 z-10 w-24 h-24 object-contain flex items-center justify-center`}
                  style={{
                    top: logoPosition.includes("top") ? 0 : "auto",
                    bottom: logoPosition.includes("bottom") ? 0 : "auto",
                    right: logoPosition.includes("right") ? 0 : "auto",
                    left: logoPosition.includes("left") ? 0 : "auto",
                    filter: invertLogo ? "invert(1) brightness(2)" : "none"
                  }}
                >
                  <img src={logoImage} alt="Logo" className="max-w-full max-h-full object-contain drop-shadow-md" crossOrigin="anonymous" />
                </div>
              )}

              {/* Label */}
              {label && (
                <div 
                  className="absolute bottom-0 right-0 px-4 py-2 z-10"
                  style={{ backgroundColor: bannerColor }}
                >
                  <span 
                    className="text-sm font-bold uppercase tracking-wider"
                    style={{ color: labelColor }}
                  >
                    {label}
                  </span>
                </div>
              )}
            </div>

            {/* Bottom Text Area */}
            <div 
              className="relative flex-1 flex flex-col justify-center px-8 py-6 z-20"
              style={{ backgroundColor: bannerColor }}
            >
              <h1 
                className="leading-tight break-words mb-2"
                style={{ 
                  color: textColor, 
                  fontSize: `${fontSize}px`,
                  fontWeight: fontWeight,
                  textShadow: textShadow ? "0 2px 10px rgba(0,0,0,0.3)" : "none"
                }}
              >
                {title}
              </h1>
              {subtitle && (
                <p 
                  className="opacity-90 leading-snug"
                  style={{ 
                    color: textColor, 
                    fontSize: `${Math.max(16, fontSize * 0.45)}px`,
                    fontWeight: 400,
                    textShadow: textShadow ? "0 1px 5px rgba(0,0,0,0.3)" : "none"
                  }}
                >
                  {subtitle}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col h-screen w-full bg-slate-50 text-slate-900" dir="rtl">
      {/* Header */}
      <header className="h-16 border-b border-slate-200 bg-white flex items-center justify-between px-6 shrink-0 z-10">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-red-600 flex items-center justify-center text-white">
            <LayoutTemplate size={18} />
          </div>
          <h1 className="font-bold text-xl tracking-tight text-slate-900 font-['Cairo']">صانع البطاقات الإخبارية</h1>
        </div>
        <div className="flex items-center gap-4">
          <Button 
            onClick={handleDownload} 
            disabled={isExporting}
            className="bg-red-600 hover:bg-red-700 text-white shadow-sm"
          >
            {isExporting ? "جاري التصدير..." : "تصدير الصورة"}
            <Download className="mr-2" size={16} />
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex flex-1 overflow-hidden">
        
        {/* Sidebar Controls */}
        <aside className="w-96 shrink-0 bg-white border-l border-slate-200 flex flex-col z-10 shadow-lg">
          <Tabs defaultValue="content" className="flex-1 flex flex-col">
            <TabsList className="w-full h-14 rounded-none border-b border-slate-100 bg-slate-50 p-0 justify-start">
              <TabsTrigger value="content" className="flex-1 h-full rounded-none data-[state=active]:bg-white data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-red-600">
                <Type size={16} className="ml-2" />
                المحتوى
              </TabsTrigger>
              <TabsTrigger value="design" className="flex-1 h-full rounded-none data-[state=active]:bg-white data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-red-600">
                <Palette size={16} className="ml-2" />
                التصميم
              </TabsTrigger>
              <TabsTrigger value="layout" className="flex-1 h-full rounded-none data-[state=active]:bg-white data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-red-600">
                <Settings2 size={16} className="ml-2" />
                الأبعاد
              </TabsTrigger>
            </TabsList>
            
            <ScrollArea className="flex-1" dir="rtl">
              <div className="p-6 space-y-8">
                
                {/* Content Tab */}
                <TabsContent value="content" className="mt-0 space-y-6">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>العنوان الرئيسي</Label>
                      <Input 
                        value={title} 
                        onChange={(e) => setTitle(e.target.value)} 
                        className="text-right text-lg py-6"
                        dir="rtl"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label>النص الفرعي (اختياري)</Label>
                      <Input 
                        value={subtitle} 
                        onChange={(e) => setSubtitle(e.target.value)} 
                        className="text-right"
                        dir="rtl"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label>التصنيف / الشريط (اختياري)</Label>
                      <Input 
                        value={label} 
                        onChange={(e) => setLabel(e.target.value)} 
                        className="text-right"
                        dir="rtl"
                      />
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-4">
                    <Label className="text-base font-bold flex items-center gap-2">
                      <ImageIcon size={16} />
                      الوسائط
                    </Label>
                    
                    <div className="space-y-2">
                      <Label className="text-sm text-slate-500">صورة الخلفية</Label>
                      <div className="flex gap-2">
                        <Input 
                          ref={bgInputRef}
                          type="file" 
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => handleImageUpload(e, setBgImage)}
                        />
                        <Button variant="outline" className="w-full" onClick={() => bgInputRef.current?.click()}>
                          <Upload className="ml-2" size={16} />
                          {bgImage ? "تغيير الصورة" : "اختر صورة"}
                        </Button>
                        {bgImage && (
                          <Button variant="outline" className="text-red-600 hover:text-red-700" onClick={() => setBgImage(null)}>
                            إزالة
                          </Button>
                        )}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-sm text-slate-500">الشعار (اللوجو)</Label>
                      <div className="flex gap-2">
                        <Input 
                          ref={logoInputRef}
                          type="file" 
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => handleImageUpload(e, setLogoImage)}
                        />
                        <Button variant="outline" className="w-full" onClick={() => logoInputRef.current?.click()}>
                          <Upload className="ml-2" size={16} />
                          {logoImage ? "تغيير الشعار" : "اختر شعار"}
                        </Button>
                        {logoImage && (
                          <Button variant="outline" className="text-red-600 hover:text-red-700" onClick={() => setLogoImage(null)}>
                            إزالة
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </TabsContent>

                {/* Design Tab */}
                <TabsContent value="design" className="mt-0 space-y-8">
                  <div className="space-y-4">
                    <Label className="text-base font-bold">الألوان</Label>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-xs">لون الخلفية</Label>
                        <div className="flex items-center gap-2">
                          <input 
                            type="color" 
                            value={bannerColor}
                            onChange={(e) => setBannerColor(e.target.value)}
                            className="w-8 h-8 rounded cursor-pointer border-0 p-0"
                          />
                          <Input value={bannerColor} onChange={(e) => setBannerColor(e.target.value)} className="h-8 font-mono text-xs text-left" dir="ltr" />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-xs">لون النص</Label>
                        <div className="flex items-center gap-2">
                          <input 
                            type="color" 
                            value={textColor}
                            onChange={(e) => setTextColor(e.target.value)}
                            className="w-8 h-8 rounded cursor-pointer border-0 p-0"
                          />
                          <Input value={textColor} onChange={(e) => setTextColor(e.target.value)} className="h-8 font-mono text-xs text-left" dir="ltr" />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-xs">لون التصنيف</Label>
                        <div className="flex items-center gap-2">
                          <input 
                            type="color" 
                            value={labelColor}
                            onChange={(e) => setLabelColor(e.target.value)}
                            className="w-8 h-8 rounded cursor-pointer border-0 p-0"
                          />
                          <Input value={labelColor} onChange={(e) => setLabelColor(e.target.value)} className="h-8 font-mono text-xs text-left" dir="ltr" />
                        </div>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-4">
                    <Label className="text-base font-bold">الخطوط والنصوص</Label>
                    
                    <div className="space-y-2">
                      <Label className="text-xs">نوع الخط</Label>
                      <Select value={fontFamily} onValueChange={setFontFamily}>
                        <SelectTrigger className="w-full text-right" dir="rtl">
                          <SelectValue placeholder="اختر الخط" />
                        </SelectTrigger>
                        <SelectContent dir="rtl">
                          <SelectItem value="Cairo">Cairo</SelectItem>
                          <SelectItem value="Tajawal">Tajawal</SelectItem>
                          <SelectItem value="Noto Kufi Arabic">Noto Kufi Arabic</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-xs">وزن الخط</Label>
                      <Select value={fontWeight} onValueChange={setFontWeight}>
                        <SelectTrigger className="w-full text-right" dir="rtl">
                          <SelectValue placeholder="اختر الوزن" />
                        </SelectTrigger>
                        <SelectContent dir="rtl">
                          <SelectItem value="400">عادي (Regular)</SelectItem>
                          <SelectItem value="700">عريض (Bold)</SelectItem>
                          <SelectItem value="900">عريض جداً (Black)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-3 pt-2">
                      <div className="flex items-center justify-between">
                        <Label className="text-xs">حجم النص الرئيسي ({fontSize}px)</Label>
                      </div>
                      <Slider
                        value={[fontSize]}
                        onValueChange={(vals) => setFontSize(vals[0])}
                        min={16}
                        max={80}
                        step={1}
                        dir="rtl"
                      />
                    </div>

                    <div className="flex items-center justify-between pt-2">
                      <Label className="text-xs cursor-pointer" htmlFor="text-shadow">ظل للنص (يساعد على القراءة)</Label>
                      <Switch id="text-shadow" checked={textShadow} onCheckedChange={setTextShadow} />
                    </div>
                  </div>
                </TabsContent>

                {/* Layout Tab */}
                <TabsContent value="layout" className="mt-0 space-y-8">
                  <div className="space-y-4">
                    <Label className="text-base font-bold">أبعاد الصورة</Label>
                    <div className="grid grid-cols-2 gap-3">
                      {(Object.keys(SIZES) as AspectRatio[]).map((ratio) => (
                        <Button
                          key={ratio}
                          variant={aspectRatio === ratio ? "default" : "outline"}
                          className={`h-auto py-3 px-2 flex flex-col gap-2 ${aspectRatio === ratio ? 'bg-red-600 hover:bg-red-700 text-white' : ''}`}
                          onClick={() => setAspectRatio(ratio)}
                        >
                          <div className={`border-2 rounded opacity-50 ${aspectRatio === ratio ? 'border-white' : 'border-slate-400'}`} style={{
                            width: "24px",
                            height: `${(SIZES[ratio].preview.h / SIZES[ratio].preview.w) * 24}px`
                          }} />
                          <span className="text-xs">{SIZES[ratio].label}</span>
                        </Button>
                      ))}
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-4">
                    <Label className="text-base font-bold">مساحة التصميم</Label>
                    <div className="space-y-3 pt-2">
                      <div className="flex items-center justify-between">
                        <Label className="text-xs">نسبة مساحة الصورة ({photoHeight}%)</Label>
                      </div>
                      <Slider
                        value={[photoHeight]}
                        onValueChange={(vals) => setPhotoHeight(vals[0])}
                        min={20}
                        max={80}
                        step={1}
                        dir="rtl"
                      />
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-4">
                    <Label className="text-base font-bold">الشعار (اللوجو)</Label>
                    <div className="space-y-2">
                      <Label className="text-xs">موضع الشعار</Label>
                      <Select value={logoPosition} onValueChange={setLogoPosition}>
                        <SelectTrigger className="w-full text-right" dir="rtl">
                          <SelectValue placeholder="اختر الموضع" />
                        </SelectTrigger>
                        <SelectContent dir="rtl">
                          <SelectItem value="top-right">أعلى اليمين</SelectItem>
                          <SelectItem value="top-left">أعلى اليسار</SelectItem>
                          <SelectItem value="bottom-right">أسفل اليمين</SelectItem>
                          <SelectItem value="bottom-left">أسفل اليسار</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="flex items-center justify-between pt-2">
                      <Label className="text-xs cursor-pointer" htmlFor="invert-logo">تبييض الشعار (عكس الألوان)</Label>
                      <Switch id="invert-logo" checked={invertLogo} onCheckedChange={setInvertLogo} />
                    </div>
                  </div>

                </TabsContent>
              </div>
            </ScrollArea>
          </Tabs>
        </aside>

        {/* Preview Area */}
        <section className="flex-1 bg-slate-900 relative overflow-hidden flex items-center justify-center">
          {/* Subtle grid background pattern */}
          <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px)', backgroundSize: '32px 32px' }} />
          {renderPreview()}
        </section>

      </main>
    </div>
  );
}
