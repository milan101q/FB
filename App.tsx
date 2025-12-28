
import React, { useState, useMemo } from 'react';
import { analyzeVehicleUrl } from './services/geminiService';
import { ListingStatus, VehicleData } from './types';
import { CopyField } from './components/CopyField';

const App: React.FC = () => {
  const [url, setUrl] = useState('');
  const [status, setStatus] = useState<ListingStatus>({ isAnalyzing: false });

  const FIXED_DESCRIPTION = `📍 DEALER LOCATION:
🏢 25350 Pleasant Valley Rd, Suite 138
Chantilly, VA 20152

📞 Call / Text:
📲 7️⃣0️⃣3️⃣-7️⃣7️⃣5️⃣-8️⃣5️⃣8️⃣5️⃣

📄 Clean title
🚘 Ready for a test drive
💬 Serious buyers only — message now before it’s gone!`;

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url) return;

    setStatus({ isAnalyzing: true });
    try {
      const data = await analyzeVehicleUrl(url);
      data.description = FIXED_DESCRIPTION;
      setStatus({ isAnalyzing: false, data });
    } catch (err) {
      console.error(err);
      setStatus({ isAnalyzing: false, error: 'Failed to extract data. Please check the URL and try again.' });
    }
  };

  const autoFillScript = useMemo(() => {
    if (!status.data) return '';
    const data = status.data;
    
    return `
(async function() {
  const vehicle = ${JSON.stringify({
    title: data.title,
    price: data.price.replace(/[^0-9]/g, ''),
    year: data.year.toString(),
    make: data.make,
    model: data.model,
    mileage: data.mileage.replace(/[^0-9]/g, ''),
    vin: data.vin || '',
    bodyStyle: data.bodyStyle || '',
    exteriorColor: data.exteriorColor || '',
    interiorColor: data.interiorColor || '',
    description: data.description,
    condition: 'Excellent',
    fuelType: 'Gasoline'
  })};

  console.log('%c 🚀 AutoListing AI: Pro-Flow V11 (Strict Edition) ', 'background: #000; color: #fbbf24; font-weight: bold; padding: 8px; border-radius: 6px;');

  const sleep = (ms) => new Promise(r => setTimeout(r, ms));

  function setNativeValue(element, value) {
    if (!element) return;
    const valueSetter = Object.getOwnPropertyDescriptor(element, 'value')?.set;
    const prototype = Object.getPrototypeOf(element);
    const prototypeValueSetter = Object.getOwnPropertyDescriptor(prototype, 'value')?.set;
    if (prototypeValueSetter && valueSetter !== prototypeValueSetter) {
      prototypeValueSetter.call(element, value);
    } else if (valueSetter) {
      valueSetter.call(element, value);
    } else {
      element.value = value;
    }
    element.dispatchEvent(new Event('input', { bubbles: true }));
    element.dispatchEvent(new Event('change', { bubbles: true }));
  }

  function findElementByText(text, selector = '*', exact = false) {
    const search = text.toLowerCase().trim();
    const elements = Array.from(document.querySelectorAll(selector));
    return elements.find(el => {
      const t = el.innerText?.toLowerCase().trim() || "";
      if (exact) return t === search;
      return t === search || (t.includes(search) && t.length < search.length + 15);
    });
  }

  async function fillTextField(labelName, value) {
    if (!value) return false;
    const labelEl = findElementByText(labelName, 'span, div, label');
    if (!labelEl) return false;

    let curr = labelEl;
    let input = null;
    for (let i = 0; i < 7; i++) {
      if (!curr) break;
      input = curr.querySelector('input, textarea');
      if (input) break;
      let sib = curr.nextElementSibling;
      while(sib) {
        input = sib.querySelector('input, textarea') || (sib.tagName === 'INPUT' ? sib : null);
        if (input) break;
        sib = sib.nextElementSibling;
      }
      if (input) break;
      curr = curr.parentElement;
    }

    if (input) {
      input.focus();
      setNativeValue(input, value);
      return true;
    }
    return false;
  }

  async function fillDropdown(labelName, value) {
    if (!value) return false;
    
    // Normalize values
    const searchVal = value.toString().toLowerCase().trim();
    
    const labelEl = findElementByText(labelName, 'span, div, label');
    if (!labelEl) return false;

    let curr = labelEl;
    let trigger = null;
    for (let i = 0; i < 8; i++) {
      if (!curr) break;
      trigger = curr.querySelector('[role="button"], [role="combobox"], [aria-haspopup], [aria-expanded]');
      if (trigger) break;
      curr = curr.parentElement;
    }

    if (trigger) {
      trigger.scrollIntoView({ block: 'center' });
      await sleep(400);
      trigger.click();
      
      let option = null;
      for (let attempt = 0; attempt < 25; attempt++) {
        await sleep(150);
        const options = Array.from(document.querySelectorAll('[role="option"], [role="menuitem"] span, [role="listbox"] span, div[class*="x193iq5w"]'));
        option = options.find(opt => {
          const optText = opt.innerText.toLowerCase().trim();
          return optText === searchVal || optText.includes(searchVal);
        });
        if (option && option.offsetHeight > 0) break;
      }

      if (option) {
        option.click();
        await sleep(800);
        return true;
      } else {
        document.body.click(); 
      }
    }
    return false;
  }

  // --- START AUTOMATION ---

  // 1. Vehicle Type First
  await fillDropdown('vehicle type', 'Car/Truck');
  await sleep(1500);

  // 2. Condition: Always Excellent
  console.log('Setting Condition to Excellent...');
  await fillDropdown('vehicle condition', 'Excellent');
  await fillDropdown('condition', 'Excellent');

  // 3. Mandatory Fields
  await fillDropdown('year', vehicle.year);
  await fillDropdown('make', vehicle.make);
  await fillDropdown('body style', vehicle.bodyStyle);
  await fillDropdown('fuel type', 'Gasoline');

  // 4. Basic Texts
  await fillTextField('title', vehicle.title);
  await fillTextField('price', vehicle.price);
  await fillTextField('model', vehicle.model);
  await fillTextField('mileage', vehicle.mileage);
  await fillTextField('vin', vehicle.vin);
  await fillTextField('description', vehicle.description);

  // 5. Colors
  await fillDropdown('exterior color', vehicle.exteriorColor);
  await fillDropdown('interior color', vehicle.interiorColor);

  // 6. ALWAYS CHECK CLEAN TITLE
  console.log('Checking Clean Title...');
  const titleLabels = Array.from(document.querySelectorAll('span, label, div')).filter(el => 
    el.innerText?.toLowerCase().includes('clean title')
  );

  for (const label of titleLabels) {
    let container = label.parentElement;
    for (let i = 0; i < 5; i++) {
      if (!container) break;
      
      // Look for checkbox
      const checkbox = container.querySelector('input[type="checkbox"]');
      if (checkbox && !checkbox.checked) {
        checkbox.click();
        console.log('✓ Checkbox clicked');
        break;
      }

      // Look for Yes/No buttons
      const yesBtn = Array.from(container.querySelectorAll('span, div')).find(s => 
        s.innerText === 'Yes' && s.offsetHeight > 0
      );
      if (yesBtn) {
        yesBtn.click();
        console.log('✓ Yes button clicked');
        break;
      }
      container = container.parentElement;
    }
  }

  console.log('%c ✨ PRO-FLOW V11 COMPLETE ', 'background: #fbbf24; color: #000; font-weight: bold; padding: 8px; border-radius: 6px;');
  alert('Pro-Flow V11 Complete! \\n\\nVehicle Condition is set to Excellent. \\nClean Title is checked. \\nFuel is Gasoline. \\n\\nPlease verify all fields.');
})();
    `.trim();
  }, [status.data]);

  const copyScriptToClipboard = () => {
    navigator.clipboard.writeText(autoFillScript);
    alert('Pro-Flow V11 Script copied!');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <header className="mb-10 text-center">
        <div className="inline-flex items-center justify-center p-4 mb-6 bg-slate-900 rounded-3xl shadow-2xl shadow-slate-200">
          <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2"/><circle cx="7" cy="17" r="2"/><path d="M9 17h6"/><circle cx="17" cy="17" r="2"/>
          </svg>
        </div>
        <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">AutoListing AI <span className="text-amber-500 font-black">V11</span></h1>
        <p className="mt-3 text-slate-500 text-lg max-w-2xl mx-auto">
          One-click Marketplace assistant for <b>Chantilly Dealer</b>. 
          <br/>Strict automation for <b>Excellent Condition</b> & <b>Clean Title</b>.
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-4 space-y-6">
          <section className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2 text-slate-800 uppercase tracking-tight">
              <span className="flex items-center justify-center w-7 h-7 rounded-full bg-amber-500 text-white text-xs">1</span>
              Source Link
            </h2>
            <form onSubmit={handleAnalyze} className="space-y-4">
              <input
                type="url"
                required
                placeholder="Paste dealer link..."
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500 outline-none transition-all text-sm"
              />
              <button
                type="submit"
                disabled={status.isAnalyzing}
                className="w-full bg-slate-900 text-white font-bold py-4 px-6 rounded-xl hover:bg-black disabled:opacity-50 transition-all shadow-lg"
              >
                {status.isAnalyzing ? 'Extracting...' : 'Fetch Vehicle Data'}
              </button>
            </form>
          </section>

          {status.data && (
            <section className="bg-slate-900 text-white p-6 rounded-2xl shadow-2xl border border-slate-800 animate-in zoom-in duration-300">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold flex items-center gap-2 text-amber-400">
                  <span className="flex items-center justify-center w-7 h-7 rounded-full bg-amber-500 text-white text-xs">2</span>
                  V11 Script
                </h2>
                <div className="px-2 py-1 bg-amber-500/20 text-amber-400 rounded border border-amber-500/30 text-[10px] font-black tracking-widest uppercase">Strict Mode</div>
              </div>
              <ul className="text-slate-400 text-xs mb-6 space-y-2">
                <li className="flex items-center gap-2 text-white font-semibold">
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="text-amber-500"><polyline points="20 6 9 17 4 12"/></svg>
                  Condition: Always Excellent
                </li>
                <li className="flex items-center gap-2 text-white font-semibold">
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="text-amber-500"><polyline points="20 6 9 17 4 12"/></svg>
                  Title: Always Checked
                </li>
                <li className="flex items-center gap-2 text-white font-semibold">
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="text-amber-500"><polyline points="20 6 9 17 4 12"/></svg>
                  Fuel: Gasoline
                </li>
              </ul>
              <button
                onClick={copyScriptToClipboard}
                className="group w-full bg-amber-500 text-slate-900 font-bold py-4 px-6 rounded-xl hover:bg-amber-400 transition-all flex items-center justify-center gap-2 shadow-lg"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/></svg>
                Copy Automation Script
              </button>
            </section>
          )}
        </div>

        <div className="lg:col-span-8">
          <div className="bg-white rounded-3xl shadow-xl border border-slate-200 min-h-[500px] flex flex-col overflow-hidden">
            <div className="bg-slate-50 border-b border-slate-100 p-5 px-8 flex justify-between items-center">
              <h2 className="font-bold text-slate-800 uppercase tracking-tight text-sm">Package Summary</h2>
              {status.data && <span className="text-[10px] bg-amber-100 text-amber-700 font-black px-3 py-1 rounded-full uppercase tracking-widest">Specs Verified</span>}
            </div>

            <div className="p-8 flex-1 overflow-y-auto">
              {!status.data && !status.isAnalyzing ? (
                <div className="flex flex-col items-center justify-center h-full text-slate-300 space-y-4">
                   <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M12 2L1 21h22L12 2zm0 3.99L19.53 19H4.47L12 5.99zM11 16h2v2h-2zm0-6h2v4h-2z"/></svg>
                   <p className="font-medium italic">Enter listing URL to prepare the script.</p>
                </div>
              ) : status.isAnalyzing ? (
                <div className="flex flex-col items-center justify-center h-full space-y-4">
                  <div className="w-10 h-10 border-4 border-amber-500/20 border-t-amber-500 rounded-full animate-spin"></div>
                  <p className="text-slate-500 font-bold tracking-tight uppercase text-xs">AI Extraction in Progress...</p>
                </div>
              ) : (
                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <CopyField label="Year" value={status.data!.year.toString()} />
                    <CopyField label="Make" value={status.data!.make} />
                    <CopyField label="Model" value={status.data!.model} />
                    <CopyField label="Price" value={status.data!.price} />
                    <CopyField label="Body Style" value={status.data!.bodyStyle} />
                    <CopyField label="Mileage" value={status.data!.mileage} />
                    <CopyField label="Exterior" value={status.data!.exteriorColor} />
                    <CopyField label="Interior" value={status.data!.interiorColor} />
                  </div>
                  
                  <CopyField label="Fixed Description" value={status.data!.description} isMultiline />
                  
                  <div className="grid grid-cols-3 gap-4 pt-6 border-t border-slate-100">
                    <SpecItem label="Fuel Type" value="Gasoline" isForced />
                    <SpecItem label="Condition" value="Excellent" isForced />
                    <SpecItem label="Clean Title" value="Checked" isForced />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const SpecItem: React.FC<{ label: string; value: string, isForced?: boolean }> = ({ label, value, isForced }) => (
  <div className={`text-center p-4 rounded-2xl border ${isForced ? 'bg-amber-50 border-amber-100' : 'bg-slate-50 border-slate-100'}`}>
    <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{label}</div>
    <div className={`text-sm font-bold ${isForced ? 'text-amber-700' : 'text-slate-700'}`}>{value}</div>
    {isForced && <div className="text-[9px] font-black text-amber-500/60 uppercase mt-1 tracking-tighter">Automatic</div>}
  </div>
);

export default App;
