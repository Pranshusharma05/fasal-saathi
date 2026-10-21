import { useState, useEffect, useCallback } from 'react';
import { Header } from './components/Header';
import { HomeView } from './components/HomeView';
import { PredictionForm } from './components/PredictionForm';
import { LoadingScreen } from './components/LoadingScreen';
import { ResultView } from './components/ResultView';
import { HowItWorksView } from './components/HowItWorksView';
import { AboutView } from './components/AboutView';
import { Language } from './translations';
import { PredictFormData, PredictionResponse, predictYield } from './api/predict';

const DEFAULT_BLANK_FORM: PredictFormData = {
  state: '',
  district: '',
  crop: '',
  season: 'rabi',
  area: 5,
  unit: 'acre',
};

export default function App() {
  const [currentLang, setCurrentLang] = useState<Language>('hi');

  // Route state parsed from URL
  const [currentPath, setCurrentPath] = useState<string>('/');
  const [currentStep, setCurrentStep] = useState<number>(1);

  // Form data - preserved across steps
  const [formData, setFormData] = useState<PredictFormData>(DEFAULT_BLANK_FORM);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [predictionResult, setPredictionResult] = useState<PredictionResponse | null>(null);

  // Sync html lang tag
  useEffect(() => {
    document.documentElement.lang = currentLang;
  }, [currentLang]);

  // Parse location and sync router
  const syncRouteFromLocation = useCallback(() => {
    if (typeof window === 'undefined') return;
    const path = window.location.pathname || '/';
    const params = new URLSearchParams(window.location.search);
    let step = parseInt(params.get('step') || '1', 10);
    if (isNaN(step) || step < 1 || step > 3) step = 1;

    setCurrentPath(path);
    setCurrentStep(step);
  }, []);

  // Browser navigation popstate listener
  useEffect(() => {
    syncRouteFromLocation();
    const handlePopState = () => {
      syncRouteFromLocation();
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [syncRouteFromLocation]);

  // Navigate helper with history push / replace
  const navigate = useCallback((path: string, searchParams?: Record<string, string | number>, push = true) => {
    const newParams = new URLSearchParams();

    if (searchParams) {
      Object.entries(searchParams).forEach(([k, v]) => newParams.set(k, String(v)));
    }

    const queryStr = newParams.toString() ? `?${newParams.toString()}` : '';
    const fullUrl = `${path}${queryStr}`;

    if (push) {
      window.history.pushState(null, '', fullUrl);
    } else {
      window.history.replaceState(null, '', fullUrl);
    }

    setCurrentPath(path);
    setCurrentStep(searchParams?.step ? Number(searchParams.step) : 1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  // Redirect /result to /predict?step=1 if no fresh result was generated
  useEffect(() => {
    if (currentPath === '/result' && !predictionResult && !isLoading) {
      navigate('/predict', { step: 1 }, false);
    }
  }, [currentPath, predictionResult, isLoading, navigate]);

  const handleToggleLanguage = () => {
    setCurrentLang((prev) => (prev === 'hi' ? 'en' : 'hi'));
  };

  /**
   * Main CTA on Home and in Header:
   * ALWAYS starts a FRESH form at step 1 with empty fields.
   * It must never jump to the result page.
   */
  const handleStartFreshPredict = () => {
    setFormData(DEFAULT_BLANK_FORM);
    setPredictionResult(null);
    setIsLoading(false);
    navigate('/predict', { step: 1 }, true);
  };

  // Step change within the form pushes browser history
  const handleStepChange = (targetStep: number) => {
    navigate('/predict', { step: targetStep }, true);
  };

  // Form submission handler
  const handleFormSubmit = async (data: PredictFormData) => {
    setFormData(data);
    setIsLoading(true);

    try {
      const response = await predictYield(data);
      setPredictionResult(response);
      navigate('/result', undefined, true);
    } catch (err) {
      console.error('Prediction failed', err);
      window.alert(err instanceof Error ? err.message : 'Prediction failed');
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * "✏️ जानकारी बदलें" on Result page:
   * Goes to form step 3 with all previous answers filled in.
   */
  const handleEditDetails = () => {
    navigate('/predict', { step: 3 }, true);
  };

  /**
   * "🔄 नया अनुमान" on Result page:
   * Clears everything and goes to step 1.
   */
  const handleNewPrediction = () => {
    handleStartFreshPredict();
  };

  return (
    <div className="min-h-screen bg-[#FAF6EC] text-[#1C1B18] flex flex-col justify-between selection:bg-[#C9922E]/25 selection:text-[#14391F]">
      <div>
        {/* Sticky Translucent Header */}
        <Header
          currentLang={currentLang}
          onToggleLang={handleToggleLanguage}
          currentPath={currentPath}
          onNavigate={(path) => navigate(path, undefined, true)}
          onStartFreshPredict={handleStartFreshPredict}
        />

        {/* Main Content Router */}
        <main className={currentPath === '/' ? '' : 'pt-[68px] sm:pt-[72px] md:pt-[76px]'}>
          {/* Route: Home (/) */}
          {currentPath === '/' && (
            <HomeView
              currentLang={currentLang}
              onStartFreshPredict={handleStartFreshPredict}
              onNavigate={(path) => navigate(path, undefined, true)}
            />
          )}

          {/* Route: Prediction Form (/predict) */}
          {currentPath === '/predict' && (
            <>
              {isLoading ? (
                <LoadingScreen currentLang={currentLang} />
              ) : (
                <PredictionForm
                  currentLang={currentLang}
                  currentStep={currentStep}
                  initialData={formData}
                  onStepChange={handleStepChange}
                  onSubmit={handleFormSubmit}
                  onGoHome={() => navigate('/', undefined, true)}
                />
              )}
            </>
          )}

          {/* Route: Result Page (/result) */}
          {currentPath === '/result' && predictionResult && (
            <ResultView
              prediction={predictionResult}
              formData={formData}
              currentLang={currentLang}
              onEditDetails={handleEditDetails}
              onNewPrediction={handleNewPrediction}
            />
          )}

          {/* Route: How it works (/how-it-works) */}
          {currentPath === '/how-it-works' && (
            <HowItWorksView
              currentLang={currentLang}
              onStartPredict={handleStartFreshPredict}
            />
          )}

          {/* Route: About (/about) */}
          {currentPath === '/about' && (
            <AboutView
              currentLang={currentLang}
              onStartPredict={handleStartFreshPredict}
            />
          )}
        </main>
      </div>
    </div>
  );
}
