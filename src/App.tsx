import React, { useState } from 'react';
import { Navbar } from './components/layout/Navbar';
import { Sidebar } from './components/layout/Sidebar';
import { OverviewDashboard } from './components/dashboard/OverviewDashboard';
import { QuotesManager } from './components/commercial/QuotesManager';
import { EngineeringBOM } from './components/engineering/EngineeringBOM';
import { ProductionScheduler } from './components/production/ProductionScheduler';
import { ShopFloorKiosk } from './components/mes/ShopFloorKiosk';
import { StockTraceability } from './components/inventory/StockTraceability';
import { QualityControlView } from './components/quality/QualityControlView';
import { MaintenanceOEE } from './components/maintenance/MaintenanceOEE';
import { IndustryCustomizer } from './components/customizer/IndustryCustomizer';

import { 
  INITIAL_WORK_CENTERS, 
  INITIAL_MATERIALS, 
  INITIAL_PRODUCTS, 
  INITIAL_QUOTES, 
  INITIAL_PRODUCTION_ORDERS, 
  INITIAL_SHOP_FLOOR_LOGS, 
  INITIAL_QUALITY_INSPECTIONS, 
  INITIAL_RNCS, 
  INITIAL_MAINTENANCE, 
  DEFAULT_INDUSTRY_PROFILE 
} from './data/mockIndustrialData';

import { 
  WorkCenter, 
  MaterialItem, 
  Product, 
  Quote, 
  ProductionOrder, 
  ShopFloorTimeEntry, 
  QualityInspection, 
  NonConformanceReport, 
  MaintenanceRecord, 
  IndustryProfileConfig,
  ManufacturingType
} from './types/industrial';

export default function App() {
  const [currentTab, setCurrentTab] = useState<string>('dashboard');
  const [kioskMode, setKioskMode] = useState<boolean>(false);

  // Core Industrial State
  const [config, setConfig] = useState<IndustryProfileConfig>(DEFAULT_INDUSTRY_PROFILE);
  const [workCenters, setWorkCenters] = useState<WorkCenter[]>(INITIAL_WORK_CENTERS);
  const [materials, setMaterials] = useState<MaterialItem[]>(INITIAL_MATERIALS);
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [quotes, setQuotes] = useState<Quote[]>(INITIAL_QUOTES);
  const [productionOrders, setProductionOrders] = useState<ProductionOrder[]>(INITIAL_PRODUCTION_ORDERS);
  const [shopFloorLogs, setShopFloorLogs] = useState<ShopFloorTimeEntry[]>(INITIAL_SHOP_FLOOR_LOGS);
  const [inspections, setInspections] = useState<QualityInspection[]>(INITIAL_QUALITY_INSPECTIONS);
  const [rncs, setRncs] = useState<NonConformanceReport[]>(INITIAL_RNCS);
  const [maintenanceRecords, setMaintenanceRecords] = useState<MaintenanceRecord[]>(INITIAL_MAINTENANCE);
  const [kioskPreloadedOrder, setKioskPreloadedOrder] = useState<string>('');

  // 1-Click Quote to Production Order Conversion
  const handleConvertToOrder = (quote: Quote) => {
    const existingProd = products.find(p => p.code === quote.productCode) || products[0];
    const newOrderNumber = `OP-2026-0${Math.floor(150 + Math.random() * 850)}`;
    const newSalesOrder = `PV-2026-0${Math.floor(100 + Math.random() * 850)}`;

    const newOrder: ProductionOrder = {
      id: `op-${Date.now()}`,
      orderNumber: newOrderNumber,
      salesOrderNumber: newSalesOrder,
      clientName: quote.clientName,
      productCode: quote.productCode,
      productName: quote.productName,
      targetQuantity: quote.quantity,
      producedQuantity: 0,
      scrapQuantity: 0,
      status: 'released',
      startDate: new Date().toISOString().split('T')[0],
      dueDate: new Date(Date.now() + quote.leadTimeDays * 86400000).toISOString().split('T')[0],
      priority: 'normal',
      currentOperationStep: existingProd.routing[0]?.step || 10,
      lotNumber: `LOT-2026-${newOrderNumber.replace('OP-', '')}`,
      notes: `Gerada a partir da cotação aprovada ${quote.quoteNumber}.`,
      routing: existingProd.routing.map(r => ({
        step: r.step,
        name: r.name,
        workCenterId: r.workCenterId,
        workCenterName: r.workCenterName,
        status: 'pending',
        plannedMinutes: Math.round(r.setupTimeMinutes + r.cycleTimeMinutesPerUnit * quote.quantity),
        actualMinutes: 0
      }))
    };

    setProductionOrders([newOrder, ...productionOrders]);
    setQuotes(quotes.map(q => q.id === quote.id ? { ...q, status: 'converted', convertedToOrderId: newOrderNumber } : q));
    alert(`Cotação ${quote.quoteNumber} aprovada e convertida na Ordem de Produção ${newOrderNumber} com sucesso!`);
    setCurrentTab('production');
  };

  const handleUpdateQuoteStatus = (quoteId: string, status: Quote['status']) => {
    setQuotes(quotes.map(q => q.id === quoteId ? { ...q, status } : q));
  };

  const handleAddQuote = (newQuote: Quote) => {
    setQuotes([newQuote, ...quotes]);
  };

  const handleAddNewOrder = (newOrder: ProductionOrder) => {
    setProductionOrders([newOrder, ...productionOrders]);
  };

  const handleUpdateOrderStatus = (orderId: string, status: ProductionOrder['status']) => {
    setProductionOrders(productionOrders.map(o => o.id === orderId ? { ...o, status } : o));
  };

  const handleUpdateProduct = (updated: Product) => {
    setProducts(products.map(p => p.id === updated.id ? updated : p));
  };

  const handleLogProduction = (entry: ShopFloorTimeEntry) => {
    setShopFloorLogs([entry, ...shopFloorLogs]);
    // Update order produced count
    setProductionOrders(productionOrders.map(o => {
      if (o.id === entry.orderId) {
        const newGood = o.producedQuantity + entry.goodQuantity;
        const newScrap = o.scrapQuantity + entry.scrapQuantity;
        const isDone = newGood >= o.targetQuantity;
        return {
          ...o,
          producedQuantity: newGood,
          scrapQuantity: newScrap,
          status: isDone ? 'quality_check' : 'in_progress',
          routing: o.routing.map(r => r.step === entry.operationStep ? {
            ...r,
            actualMinutes: r.actualMinutes + entry.durationMinutes,
            status: isDone ? 'completed' : 'in_progress',
            operatorName: entry.operatorName
          } : r)
        };
      }
      return o;
    }));
  };

  const handleUpdateWorkCenterStatus = (wcId: string, status: WorkCenter['status'], orderCode?: string, operator?: string) => {
    setWorkCenters(workCenters.map(w => w.id === wcId ? {
      ...w,
      status,
      currentOrderCode: orderCode,
      currentOperator: operator
    } : w));
  };

  const handleAddMaterial = (newMat: MaterialItem) => {
    setMaterials([newMat, ...materials]);
  };

  const handleUpdateStock = (matId: string, deltaQuantity: number) => {
    setMaterials(materials.map(m => {
      if (m.id === matId) {
        return { ...m, stockQuantity: Math.max(0, m.stockQuantity + deltaQuantity) };
      }
      return m;
    }));
  };

  const handleAddInspection = (newInsp: QualityInspection) => {
    setInspections([newInsp, ...inspections]);
  };

  const handleAddRNC = (newRnc: NonConformanceReport) => {
    setRncs([newRnc, ...rncs]);
  };

  const handleAddMaintenance = (newRecord: MaintenanceRecord) => {
    setMaintenanceRecords([newRecord, ...maintenanceRecords]);
  };

  const handleUpdateMaintenanceStatus = (id: string, status: MaintenanceRecord['status']) => {
    setMaintenanceRecords(maintenanceRecords.map(m => m.id === id ? { ...m, status } : m));
  };

  const handleApplyPreset = (presetId: ManufacturingType) => {
    let companyName = config.companyName;
    if (presetId === 'sheet_metal') companyName = 'Apex Caldeiraria & Corte a Laser';
    if (presetId === 'cnc_machining') companyName = 'Apex Usinagem CNC de Precisão';
    if (presetId === 'molds_tooling') companyName = 'Apex Ferramentaria & Matrizes';
    if (presetId === 'plastic_injection') companyName = 'Apex Injeção & Polímeros Industriais';
    if (presetId === 'custom_assembly') companyName = 'Apex Máquinas & Montagens Especiais';

    setConfig({
      ...config,
      profileId: presetId,
      companyName
    });
    alert(`Perfil industrial ajustado para "${companyName}" com sucesso!`);
  };

  const handleOpenKioskWithOrder = (orderNum: string) => {
    setKioskPreloadedOrder(orderNum);
    setCurrentTab('mes_kiosk');
  };

  const urgentOrdersCount = productionOrders.filter(o => o.priority === 'urgent' && o.status !== 'completed').length;
  const activeOrdersCount = productionOrders.filter(o => o.status === 'in_progress' || o.status === 'released').length;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Top Navbar */}
      <Navbar
        currentTab={currentTab}
        onNavigate={(tab) => {
          setKioskMode(tab === 'mes_kiosk');
          setCurrentTab(tab);
        }}
        kioskMode={kioskMode}
        onToggleKiosk={() => {
          const next = !kioskMode;
          setKioskMode(next);
          setCurrentTab(next ? 'mes_kiosk' : 'dashboard');
        }}
        companyName={config.companyName}
      />

      {/* Main Workspace: Sidebar + Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Render Sidebar only if not in full Kiosk Mode */}
        {!kioskMode && (
          <Sidebar
            currentTab={currentTab}
            onNavigate={(tab) => setCurrentTab(tab)}
            config={config}
            activeOrdersCount={activeOrdersCount}
            urgentOrdersCount={urgentOrdersCount}
          />
        )}

        {/* Primary Viewport Canvas */}
        <main className="flex-1 overflow-y-auto bg-slate-950">
          {currentTab === 'dashboard' && (
            <OverviewDashboard
              workCenters={workCenters}
              productionOrders={productionOrders}
              quotes={quotes}
              onNavigate={(tab) => {
                if (tab === 'mes_kiosk') setKioskMode(true);
                setCurrentTab(tab);
              }}
              onOpenOrder={(order) => {
                setCurrentTab('production');
              }}
            />
          )}

          {currentTab === 'quotes' && (
            <QuotesManager
              quotes={quotes}
              materials={materials}
              workCenters={workCenters}
              onAddQuote={handleAddQuote}
              onConvertToOrder={handleConvertToOrder}
              onUpdateQuoteStatus={handleUpdateQuoteStatus}
            />
          )}

          {currentTab === 'engineering' && (
            <EngineeringBOM
              products={products}
              materials={materials}
              workCenters={workCenters}
              onUpdateProduct={handleUpdateProduct}
            />
          )}

          {currentTab === 'production' && (
            <ProductionScheduler
              productionOrders={productionOrders}
              workCenters={workCenters}
              products={products}
              onUpdateOrderStatus={handleUpdateOrderStatus}
              onOpenKioskWithOrder={handleOpenKioskWithOrder}
              onAddNewOrder={handleAddNewOrder}
            />
          )}

          {currentTab === 'mes_kiosk' && (
            <ShopFloorKiosk
              productionOrders={productionOrders}
              workCenters={workCenters}
              activeOrderNumber={kioskPreloadedOrder}
              onLogProduction={handleLogProduction}
              onUpdateWorkCenterStatus={handleUpdateWorkCenterStatus}
            />
          )}

          {currentTab === 'inventory' && (
            <StockTraceability
              materials={materials}
              onAddMaterial={handleAddMaterial}
              onUpdateStock={handleUpdateStock}
            />
          )}

          {currentTab === 'quality' && (
            <QualityControlView
              inspections={inspections}
              rncs={rncs}
              productionOrders={productionOrders}
              onAddInspection={handleAddInspection}
              onAddRNC={handleAddRNC}
            />
          )}

          {currentTab === 'maintenance' && (
            <MaintenanceOEE
              maintenanceRecords={maintenanceRecords}
              workCenters={workCenters}
              onAddMaintenance={handleAddMaintenance}
              onUpdateMaintenanceStatus={handleUpdateMaintenanceStatus}
            />
          )}

          {currentTab === 'customizer' && (
            <IndustryCustomizer
              config={config}
              onUpdateConfig={setConfig}
              onApplyPreset={handleApplyPreset}
            />
          )}
        </main>
      </div>
    </div>
  );
}
