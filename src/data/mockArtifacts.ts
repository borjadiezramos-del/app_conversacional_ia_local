import { Artifact, StreamlitFile } from '../types';

export const STREAMLIT_CONFIG_TOML = `[theme]
primaryColor = "#2a7b9b"
backgroundColor = "#f5f5f5"
secondaryBackgroundColor = "#dcf0fa"
textColor = "#141413"
font = "sans serif"

[server]
headless = true
enableCORS = false
`;

export const STREAMLIT_APP_PY = `\"\"\"
BDR Workspace - Entorno Corporativo (Streamlit)
Arquitectura:
- Panel Izquierdo: Chat conversacional con st.session_state.messages y st.chat_input estilizado como tarjeta flotante.
- Panel Derecho: Visor interactivo de artefactos encapsulado en @st.fragment para evitar recargas completas.
- Renderizado de Iframe con st.components.v1.html.
- Identidad visual corporativa BDR.
\"\"\"

import streamlit as st
import streamlit.components.v1 as components
from datetime import datetime

# 1. Configuración de página inicial (Layout ancho, sin barra lateral por defecto)
st.set_page_config(
    page_title="BDR | Workspace",
    page_icon="🔷",
    layout="wide",
    initial_sidebar_state="collapsed",
)

# 2. Inyección de CSS personalizado para anular estilos nativos de Streamlit y aplicar Branding BDR
st.markdown(
    \"\"\"
    <style>
    /* Ocultar encabezado y pie de página de Streamlit */
    header[data-testid="stHeader"] {
        display: none !important;
    }
    footer {
        display: none !important;
    }
    #MainMenu {
        display: none !important;
    }

    /* Eliminar padding superior y márgenes excesivos */
    .block-container {
        padding-top: 1rem !important;
        padding-bottom: 0rem !important;
        padding-left: 1.5rem !important;
        padding-right: 1.5rem !important;
        max-width: 100% !important;
    }

    /* Fondo principal y fuentes */
    body, .stApp {
        background-color: #f5f5f5 !important;
        color: #141413 !important;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif !important;
    }

    /* Estilización de barras de desplazamiento (Scrollbars) BDR */
    ::-webkit-scrollbar {
        width: 6px;
        height: 6px;
    }
    ::-webkit-scrollbar-track {
        background: #f5f5f5;
    }
    ::-webkit-scrollbar-thumb {
        background: #2a7b9b;
        border-radius: 4px;
    }
    ::-webkit-scrollbar-thumb:hover {
        background: #1f5f78;
    }

    /* Contenedor del panel izquierdo (Chat) con scroll independiente */
    [data-testid="column"]:nth-of-type(1) {
        height: calc(100vh - 2.5rem);
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        padding-right: 0.75rem;
    }

    /* Contenedor del panel derecho (Artefactos) */
    [data-testid="column"]:nth-of-type(2) {
        height: calc(100vh - 2.5rem);
        background: #ffffff;
        border: 1px solid #dcf0fa;
        border-radius: 14px;
        box-shadow: 0 4px 20px rgba(42, 123, 155, 0.06);
        padding: 1rem 1.25rem;
        display: flex;
        flex-direction: column;
        overflow: hidden;
    }

    /* Estilización de la caja de chat_input como tarjeta flotante */
    [data-testid="stChatInput"] {
        background: #ffffff !important;
        border: 1.5px solid #dcf0fa !important;
        border-radius: 16px !important;
        box-shadow: 0 8px 24px rgba(42, 123, 155, 0.08) !important;
        padding: 0.35rem 0.6rem !important;
        margin-top: 0.5rem !important;
        transition: border-color 0.2s ease, box-shadow 0.2s ease !important;
    }
    [data-testid="stChatInput"]:focus-within {
        border-color: #2a7b9b !important;
        box-shadow: 0 8px 28px rgba(42, 123, 155, 0.16) !important;
    }
    [data-testid="stChatInput"] textarea {
        color: #141413 !important;
        font-size: 0.95rem !important;
    }

    /* Burbujas de chat BDR */
    .stChatMessage {
        background-color: transparent !important;
        padding: 0.75rem 0 !important;
    }
    [data-testid="stChatMessageContent"] {
        border-radius: 12px !important;
        padding: 0.75rem 1rem !important;
        font-size: 0.93rem !important;
        line-height: 1.5 !important;
    }
    /* Mensajes de usuario */
    div[data-testid="stChatMessage"]:has(div[aria-label="Chat message from user"]) [data-testid="stChatMessageContent"] {
        background-color: #dcf0fa !important;
        border: 1px solid rgba(42, 123, 155, 0.15) !important;
        color: #141413 !important;
    }
    /* Mensajes del asistente */
    div[data-testid="stChatMessage"]:has(div[aria-label="Chat message from assistant"]) [data-testid="stChatMessageContent"] {
        background-color: #ffffff !important;
        border: 1px solid #e8e8e8 !important;
        color: #141413 !important;
    }

    /* Botones primarios y secundarios de BDR */
    .stButton button[kind="primary"] {
        background-color: #2a7b9b !important;
        color: #ffffff !important;
        border-radius: 8px !important;
        border: none !important;
        font-weight: 600 !important;
        padding: 0.4rem 0.9rem !important;
    }
    .stButton button[kind="primary"]:hover {
        background-color: #1f5f78 !important;
    }
    .stButton button[kind="secondary"] {
        background-color: #ffffff !important;
        color: #2a7b9b !important;
        border: 1.5px solid #2a7b9b !important;
        border-radius: 8px !important;
        font-weight: 600 !important;
    }
    .stButton button[kind="secondary"]:hover {
        background-color: #dcf0fa !important;
    }

    /* Radio buttons horizontales en la barra de herramientas del artefacto */
    [data-testid="stRadio"] > div {
        flex-direction: row !important;
        gap: 0.5rem !important;
    }
    [data-testid="stRadio"] label {
        background: #f5f5f5;
        padding: 0.3rem 0.8rem;
        border-radius: 8px;
        border: 1px solid #e0e0e0;
        cursor: pointer;
        font-size: 0.85rem;
        font-weight: 500;
        transition: all 0.2s ease;
    }
    [data-testid="stRadio"] label:has(input:checked) {
        background: #dcf0fa !important;
        border-color: #2a7b9b !important;
        color: #2a7b9b !important;
        font-weight: 600 !important;
    }
    </style>
    \"\"\",
    unsafe_allow_html=True,
)

# 3. Código HTML/CSS de ejemplo para el artefacto de Dashboard BDR
DEFAULT_DASHBOARD_HTML = \"\"\"
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>BDR Dashboard Ejecutivo</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background: #f8fafc; color: #141413; }
        .bdr-primary { background-color: #2a7b9b; }
        .bdr-primary-text { color: #2a7b9b; }
        .bdr-secondary { background-color: #dcf0fa; }
        .bdr-border { border-color: #2a7b9b; }
    </style>
</head>
<body class="p-6">
    <div class="flex items-center justify-between pb-5 border-b border-slate-200">
        <div class="flex items-center space-x-3">
            <div class="w-10 h-10 rounded-lg bdr-primary flex items-center justify-center text-white font-bold tracking-wider shadow-sm">
                BDR
            </div>
            <div>
                <h1 class="text-xl font-bold text-slate-900">Panel Ejecutivo de Operaciones</h1>
                <p class="text-xs text-slate-500">Métricas consolidadas en tiempo real • Marca BDR</p>
            </div>
        </div>
        <div class="flex items-center space-x-2">
            <span class="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bdr-secondary bdr-primary-text">
                <span class="w-2 h-2 mr-1.5 rounded-full bg-[#2a7b9b] animate-pulse"></span>
                Sincronizado
            </span>
            <button onclick="refreshData()" class="px-3 py-1.5 text-xs font-semibold text-white bdr-primary rounded-lg hover:bg-[#1f5f78] transition shadow-sm">
                Actualizar
            </button>
        </div>
    </div>

    <div class="grid grid-cols-3 gap-4 my-6">
        <div class="bg-white p-4 rounded-xl border border-slate-200 shadow-sm hover:border-[#2a7b9b] transition">
            <div class="flex justify-between items-start">
                <span class="text-xs font-medium text-slate-500">Ingresos Totales (YTD)</span>
                <span class="text-xs font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">+14.2%</span>
            </div>
            <div class="text-2xl font-black text-slate-900 mt-2" id="kpi-revenue">€ 1.284.950</div>
            <div class="text-xs text-slate-400 mt-1">vs. € 1.125.000 objetivo</div>
        </div>

        <div class="bg-white p-4 rounded-xl border border-slate-200 shadow-sm hover:border-[#2a7b9b] transition">
            <div class="flex justify-between items-start">
                <span class="text-xs font-medium text-slate-500">Clientes Activos</span>
                <span class="text-xs font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">+8.7%</span>
            </div>
            <div class="text-2xl font-black text-slate-900 mt-2" id="kpi-clients">3.420</div>
            <div class="text-xs text-slate-400 mt-1">Retención neta: 96.4%</div>
        </div>

        <div class="bg-white p-4 rounded-xl border border-slate-200 shadow-sm hover:border-[#2a7b9b] transition">
            <div class="flex justify-between items-start">
                <span class="text-xs font-medium text-slate-500">Eficiencia Operativa</span>
                <span class="text-xs font-bold bdr-primary-text bg-[#dcf0fa] px-1.5 py-0.5 rounded">Óptimo</span>
            </div>
            <div class="text-2xl font-black text-slate-900 mt-2" id="kpi-efficiency">94.8%</div>
            <div class="text-xs text-slate-400 mt-1">Tiempo de ciclo: 1.2 días</div>
        </div>
    </div>

    <div class="bg-white p-5 rounded-xl border border-slate-200 shadow-sm mb-6">
        <div class="flex justify-between items-center mb-4">
            <h2 class="text-sm font-bold text-slate-800">Distribución Semanal de Rendimiento</h2>
            <div class="text-xs text-slate-500">Lunes - Domingo</div>
        </div>
        <div class="flex items-end justify-between h-40 pt-6 px-2 border-b border-slate-200">
            <div class="flex flex-col items-center gap-2">
                <span class="text-[10px] font-bold text-slate-500">74%</span>
                <div class="w-8 bdr-secondary rounded-t-md hover:bg-[#2a7b9b] transition-all cursor-pointer" style="height: 74%;"></div>
                <span class="text-xs font-medium text-slate-500">Lun</span>
            </div>
            <div class="flex flex-col items-center gap-2">
                <span class="text-[10px] font-bold text-slate-500">88%</span>
                <div class="w-8 bdr-secondary rounded-t-md hover:bg-[#2a7b9b] transition-all cursor-pointer" style="height: 88%;"></div>
                <span class="text-xs font-medium text-slate-500">Mar</span>
            </div>
            <div class="flex flex-col items-center gap-2">
                <span class="text-[10px] font-bold text-slate-500">95%</span>
                <div class="w-8 bdr-primary rounded-t-md shadow-sm cursor-pointer" style="height: 95%;"></div>
                <span class="text-xs font-bold bdr-primary-text">Mie</span>
            </div>
            <div class="flex flex-col items-center gap-2">
                <span class="text-[10px] font-bold text-slate-500">82%</span>
                <div class="w-8 bdr-secondary rounded-t-md hover:bg-[#2a7b9b] transition-all cursor-pointer" style="height: 82%;"></div>
                <span class="text-xs font-medium text-slate-500">Jue</span>
            </div>
            <div class="flex flex-col items-center gap-2">
                <span class="text-[10px] font-bold text-slate-500">91%</span>
                <div class="w-8 bdr-secondary rounded-t-md hover:bg-[#2a7b9b] transition-all cursor-pointer" style="height: 91%;"></div>
                <span class="text-xs font-medium text-slate-500">Vie</span>
            </div>
            <div class="flex flex-col items-center gap-2">
                <span class="text-[10px] font-bold text-slate-500">65%</span>
                <div class="w-8 bg-slate-100 rounded-t-md hover:bg-[#2a7b9b] transition-all cursor-pointer" style="height: 65%;"></div>
                <span class="text-xs font-medium text-slate-400">Sab</span>
            </div>
            <div class="flex flex-col items-center gap-2">
                <span class="text-[10px] font-bold text-slate-500">58%</span>
                <div class="w-8 bg-slate-100 rounded-t-md hover:bg-[#2a7b9b] transition-all cursor-pointer" style="height: 58%;"></div>
                <span class="text-xs font-medium text-slate-400">Dom</span>
            </div>
        </div>
    </div>

    <div class="bg-[#dcf0fa] p-4 rounded-xl flex items-center justify-between border border-[#2a7b9b]/20">
        <div>
            <h3 class="text-sm font-bold text-[#2a7b9b]">Simulación de Acciones BDR</h3>
            <p class="text-xs text-slate-600">Interactúa con el componente sin recargar el panel de conversación.</p>
        </div>
        <div class="space-x-2">
            <button onclick="triggerAlert()" class="px-3 py-1.5 bg-white text-[#2a7b9b] font-semibold text-xs rounded-lg border border-[#2a7b9b] hover:bg-slate-50 shadow-sm">
                Inspeccionar Log
            </button>
            <button onclick="incrementStats()" class="px-3 py-1.5 bg-[#2a7b9b] text-white font-semibold text-xs rounded-lg hover:bg-[#1f5f78] shadow-sm">
                + Incrementar Métricas
            </button>
        </div>
    </div>

    <script>
        function triggerAlert() {
            alert("Artefacto BDR: Ejecución interactiva dentro del sandbox iframe aislado.");
        }
        function incrementStats() {
            const kpi = document.getElementById("kpi-clients");
            let current = parseInt(kpi.innerText.replace(".", ""));
            kpi.innerText = (current + 15).toLocaleString("es-ES");
        }
        function refreshData() {
            const rev = document.getElementById("kpi-revenue");
            rev.innerText = "€ " + (1284950 + Math.floor(Math.random() * 5000)).toLocaleString("es-ES");
        }
    </script>
</body>
</html>
\"\"\"

# 4. Inicialización del Estado de la Sesión (st.session_state)
if "messages" not in st.session_state:
    st.session_state.messages = [
        {
            "role": "assistant",
            "content": "¡Hola! Soy tu asistente de ingeniería BDR. He configurado el espacio de trabajo con arquitectura corporativa BDR. Puedes pedirme consultas o escribir **'generar dashboard'** para crear un artefacto interactivo.",
            "timestamp": datetime.now().strftime("%H:%M"),
        }
    ]

if "artifacts" not in st.session_state:
    st.session_state.artifacts = [
        {
            "title": "BDR Executive Dashboard",
            "type": "html",
            "code": DEFAULT_DASHBOARD_HTML,
            "version": 1,
            "created_at": datetime.now().strftime("%H:%M"),
        }
    ]

if "active_artifact_index" not in st.session_state:
    st.session_state.active_artifact_index = 0


# 5. Componente Encapsulado con @st.fragment para el Panel Derecho
@st.fragment
def render_artifact_panel():
    if not st.session_state.artifacts:
        st.info("No hay artefactos generados actualmente. Escribe 'generar dashboard' en el chat.")
        return

    active_idx = st.session_state.active_artifact_index
    if active_idx >= len(st.session_state.artifacts):
        active_idx = len(st.session_state.artifacts) - 1
        st.session_state.active_artifact_index = active_idx

    current_artifact = st.session_state.artifacts[active_idx]

    # Barra de herramientas superior
    col_info, col_toggle = st.columns([1.2, 1], vertical_alignment="center")

    with col_info:
        v_label = f"v{current_artifact['version']}"
        total_v = len(st.session_state.artifacts)
        st.markdown(
            f\"\"\"
            <div style="display: flex; align-items: center; gap: 8px;">
                <span style="background: #2a7b9b; color: white; padding: 2px 8px; border-radius: 6px; font-size: 11px; font-weight: 700;">
                    {v_label} / {total_v}
                </span>
                <span style="font-weight: 700; font-size: 15px; color: #141413;">
                    {current_artifact['title']}
                </span>
                <span style="font-size: 11px; color: #666; background: #dcf0fa; padding: 2px 6px; border-radius: 4px;">
                    @st.fragment aislado
                </span>
            </div>
            \"\"\",
            unsafe_allow_html=True,
        )

    with col_toggle:
        view_mode = st.radio(
            label="Modo de Visualización",
            options=["👁️ Vista Previa", "💻 Código Fuente"],
            index=0,
            horizontal=True,
            label_visibility="collapsed",
            key=f"artifact_view_mode_{active_idx}",
        )

    st.markdown("<hr style='margin: 0.5rem 0 0.8rem 0; border: none; border-top: 1px solid #eef2f6;'>", unsafe_allow_html=True)

    if view_mode == "👁️ Vista Previa":
        components.html(
            current_artifact["code"],
            height=680,
            scrolling=True,
        )
    else:
        st.caption(f"Código fuente del artefacto ({current_artifact['type'].upper()}):")
        st.code(
            current_artifact["code"],
            language="html",
            line_numbers=True,
        )


# 6. Estructura Principal de Doble Panel
left_col, right_col = st.columns([0.45, 0.55], gap="medium")

# --- PANEL IZQUIERDO: Chat Conversacional ---
with left_col:
    st.markdown(
        \"\"\"
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 0.75rem; padding-bottom: 0.5rem; border-bottom: 1px solid #e0e0e0;">
            <div style="display: flex; align-items: center; gap: 10px;">
                <div style="background: #2a7b9b; color: white; font-weight: 900; font-size: 14px; padding: 4px 10px; border-radius: 6px; letter-spacing: 0.5px;">
                    BDR
                </div>
                <div>
                    <h3 style="margin: 0; font-size: 16px; font-weight: 700; color: #141413;">Espacio Conversacional</h3>
                    <p style="margin: 0; font-size: 11px; color: #5e6d75;">Espacio Integrado • Brand BDR</p>
                </div>
            </div>
            <span style="font-size: 11px; background: #dcf0fa; color: #2a7b9b; padding: 3px 8px; border-radius: 12px; font-weight: 600;">
                Activo
            </span>
        </div>
        \"\"\",
        unsafe_allow_html=True,
    )

    chat_container = st.container(height=580)
    with chat_container:
        for msg in st.session_state.messages:
            avatar = "🔷" if msg["role"] == "assistant" else "👤"
            with st.chat_message(msg["role"], avatar=avatar):
                st.markdown(msg["content"])
                if "timestamp" in msg:
                    st.markdown(
                        f"<span style='font-size: 10px; color: #8c9ba5;'>{msg['timestamp']}</span>",
                        unsafe_allow_html=True,
                    )

    user_prompt = st.chat_input("Escribe un mensaje o 'generar dashboard'...")

    if user_prompt:
        now_time = datetime.now().strftime("%H:%M")
        st.session_state.messages.append({
            "role": "user",
            "content": user_prompt,
            "timestamp": now_time,
        })

        clean_prompt = user_prompt.strip().lower()
        if "generar dashboard" in clean_prompt or "dashboard" in clean_prompt:
            new_version = len(st.session_state.artifacts) + 1
            new_artifact_code = DEFAULT_DASHBOARD_HTML.replace(
                "Panel Ejecutivo de Operaciones",
                f"Panel Ejecutivo de Operaciones (Iteración v{new_version})"
            ).replace(
                "Métricas consolidadas en tiempo real",
                f"Generado a las {now_time} tras la petición del usuario"
            )

            st.session_state.artifacts.append({
                "title": f"BDR Dashboard v{new_version}",
                "type": "html",
                "code": new_artifact_code,
                "version": new_version,
                "created_at": now_time,
            })
            st.session_state.active_artifact_index = len(st.session_state.artifacts) - 1

            assistant_reply = (
                f"✅ **He generado el artefacto 'BDR Dashboard v{new_version}'** en el panel derecho.\\n\\n"
                f"- Se ha actualizado el visor de artefactos automáticamente.\\n"
                f"- Puedes usar los botones de opción superiores para alternar entre **Vista Previa** y **Código Fuente**.\\n"
                f"- Gracias a \`@st.fragment\`, tus interacciones en el panel derecho no recargarán este hilo de chat."
            )
        else:
            assistant_reply = (
                f"He recibido tu mensaje: *\\"{user_prompt}\\"*.\\n\\n"
                f"Si deseas crear o actualizar un componente visual interactivo con la identidad corporativa BDR, prueba escribir **'generar dashboard'**."
            )

        st.session_state.messages.append({
            "role": "assistant",
            "content": assistant_reply,
            "timestamp": datetime.now().strftime("%H:%M"),
        })

        st.rerun()

# --- PANEL DERECHO: Visor Interactivo de Artefactos ---
with right_col:
    render_artifact_panel()
`;

export const STREAMLIT_FILES: StreamlitFile[] = [
  {
    name: 'config.toml',
    path: '.streamlit/config.toml',
    language: 'toml',
    content: STREAMLIT_CONFIG_TOML,
    description: 'Configuración global de tema Streamlit con la paleta de colores corporativa BDR.',
  },
  {
    name: 'app.py',
    path: 'app.py',
    language: 'python',
    content: STREAMLIT_APP_PY,
    description: 'Código principal de Streamlit con arquitectura de doble panel, @st.fragment y visor de artefactos iframe.',
  },
];

export const INITIAL_ARTIFACTS: Artifact[] = [
  {
    id: 'art-1',
    title: 'BDR Executive Dashboard',
    type: 'html',
    version: 1,
    description: 'Panel de métricas ejecutivas en tiempo real con sistema de diseño corporativo BDR.',
    createdAt: '12:00',
    code: `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>BDR Dashboard Ejecutivo</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background: #f8fafc; color: #141413; }
    .bdr-primary { background-color: #2a7b9b; }
    .bdr-primary-text { color: #2a7b9b; }
    .bdr-secondary { background-color: #dcf0fa; }
    .bdr-border { border-color: #2a7b9b; }
  </style>
</head>
<body class="p-6">
  <!-- Header del Dashboard -->
  <div class="flex items-center justify-between pb-5 border-b border-slate-200">
    <div class="flex items-center space-x-3">
      <div class="w-10 h-10 rounded-lg bdr-primary flex items-center justify-center text-white font-bold tracking-wider shadow-sm">
        BDR
      </div>
      <div>
        <h1 class="text-xl font-bold text-slate-900">Panel Ejecutivo de Operaciones</h1>
        <p class="text-xs text-slate-500">Métricas consolidadas en tiempo real • Marca BDR</p>
      </div>
    </div>
    <div class="flex items-center space-x-2">
      <span class="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bdr-secondary bdr-primary-text">
        <span class="w-2 h-2 mr-1.5 rounded-full bg-[#2a7b9b] animate-pulse"></span>
        Sincronizado
      </span>
      <button onclick="refreshData()" class="px-3 py-1.5 text-xs font-semibold text-white bdr-primary rounded-lg hover:bg-[#1f5f78] transition shadow-sm">
        Actualizar
      </button>
    </div>
  </div>

  <!-- Tarjetas de Métricas KPI -->
  <div class="grid grid-cols-3 gap-4 my-6">
    <div class="bg-white p-4 rounded-xl border border-slate-200 shadow-sm hover:border-[#2a7b9b] transition">
      <div class="flex justify-between items-start">
        <span class="text-xs font-medium text-slate-500">Ingresos Totales (YTD)</span>
        <span class="text-xs font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">+14.2%</span>
      </div>
      <div class="text-2xl font-black text-slate-900 mt-2" id="kpi-revenue">€ 1.284.950</div>
      <div class="text-xs text-slate-400 mt-1">vs. € 1.125.000 objetivo</div>
    </div>

    <div class="bg-white p-4 rounded-xl border border-slate-200 shadow-sm hover:border-[#2a7b9b] transition">
      <div class="flex justify-between items-start">
        <span class="text-xs font-medium text-slate-500">Clientes Activos</span>
        <span class="text-xs font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">+8.7%</span>
      </div>
      <div class="text-2xl font-black text-slate-900 mt-2" id="kpi-clients">3.420</div>
      <div class="text-xs text-slate-400 mt-1">Retención neta: 96.4%</div>
    </div>

    <div class="bg-white p-4 rounded-xl border border-slate-200 shadow-sm hover:border-[#2a7b9b] transition">
      <div class="flex justify-between items-start">
        <span class="text-xs font-medium text-slate-500">Eficiencia Operativa</span>
        <span class="text-xs font-bold bdr-primary-text bg-[#dcf0fa] px-1.5 py-0.5 rounded">Óptimo</span>
      </div>
      <div class="text-2xl font-black text-slate-900 mt-2" id="kpi-efficiency">94.8%</div>
      <div class="text-xs text-slate-400 mt-1">Tiempo de ciclo: 1.2 días</div>
    </div>
  </div>

  <!-- Gráfico Visual de Barras (HTML / CSS puro) -->
  <div class="bg-white p-5 rounded-xl border border-slate-200 shadow-sm mb-6">
    <div class="flex justify-between items-center mb-4">
      <h2 class="text-sm font-bold text-slate-800">Distribución Semanal de Rendimiento</h2>
      <div class="text-xs text-slate-500">Lunes - Domingo</div>
    </div>
    <div class="flex items-end justify-between h-40 pt-6 px-2 border-b border-slate-200">
      <div class="flex flex-col items-center gap-2">
        <span class="text-[10px] font-bold text-slate-500">74%</span>
        <div class="w-8 bdr-secondary rounded-t-md hover:bg-[#2a7b9b] transition-all cursor-pointer" style="height: 74%;"></div>
        <span class="text-xs font-medium text-slate-500">Lun</span>
      </div>
      <div class="flex flex-col items-center gap-2">
        <span class="text-[10px] font-bold text-slate-500">88%</span>
        <div class="w-8 bdr-secondary rounded-t-md hover:bg-[#2a7b9b] transition-all cursor-pointer" style="height: 88%;"></div>
        <span class="text-xs font-medium text-slate-500">Mar</span>
      </div>
      <div class="flex flex-col items-center gap-2">
        <span class="text-[10px] font-bold text-slate-500">95%</span>
        <div class="w-8 bdr-primary rounded-t-md shadow-sm cursor-pointer" style="height: 95%;"></div>
        <span class="text-xs font-bold bdr-primary-text">Mie</span>
      </div>
      <div class="flex flex-col items-center gap-2">
        <span class="text-[10px] font-bold text-slate-500">82%</span>
        <div class="w-8 bdr-secondary rounded-t-md hover:bg-[#2a7b9b] transition-all cursor-pointer" style="height: 82%;"></div>
        <span class="text-xs font-medium text-slate-500">Jue</span>
      </div>
      <div class="flex flex-col items-center gap-2">
        <span class="text-[10px] font-bold text-slate-500">91%</span>
        <div class="w-8 bdr-secondary rounded-t-md hover:bg-[#2a7b9b] transition-all cursor-pointer" style="height: 91%;"></div>
        <span class="text-xs font-medium text-slate-500">Vie</span>
      </div>
      <div class="flex flex-col items-center gap-2">
        <span class="text-[10px] font-bold text-slate-500">65%</span>
        <div class="w-8 bg-slate-100 rounded-t-md hover:bg-[#2a7b9b] transition-all cursor-pointer" style="height: 65%;"></div>
        <span class="text-xs font-medium text-slate-400">Sab</span>
      </div>
      <div class="flex flex-col items-center gap-2">
        <span class="text-[10px] font-bold text-slate-500">58%</span>
        <div class="w-8 bg-slate-100 rounded-t-md hover:bg-[#2a7b9b] transition-all cursor-pointer" style="height: 58%;"></div>
        <span class="text-xs font-medium text-slate-400">Dom</span>
      </div>
    </div>
  </div>

  <!-- Panel Interactivo de Acciones -->
  <div class="bg-[#dcf0fa] p-4 rounded-xl flex items-center justify-between border border-[#2a7b9b]/20">
    <div>
      <h3 class="text-sm font-bold text-[#2a7b9b]">Simulación de Acciones BDR</h3>
      <p class="text-xs text-slate-600">Interactúa con el componente sin recargar el panel de conversación.</p>
    </div>
    <div class="space-x-2">
      <button onclick="triggerAlert()" class="px-3 py-1.5 bg-white text-[#2a7b9b] font-semibold text-xs rounded-lg border border-[#2a7b9b] hover:bg-slate-50 shadow-sm">
        Inspeccionar Log
      </button>
      <button onclick="incrementStats()" class="px-3 py-1.5 bg-[#2a7b9b] text-white font-semibold text-xs rounded-lg hover:bg-[#1f5f78] shadow-sm">
        + Incrementar Métricas
      </button>
    </div>
  </div>

  <script>
    function triggerAlert() {
      alert("Artefacto BDR: Ejecución interactiva dentro del sandbox iframe aislado.");
    }
    function incrementStats() {
      const kpi = document.getElementById("kpi-clients");
      let current = parseInt(kpi.innerText.replace(".", ""));
      kpi.innerText = (current + 15).toLocaleString("es-ES");
    }
    function refreshData() {
      const rev = document.getElementById("kpi-revenue");
      rev.innerText = "€ " + (1284950 + Math.floor(Math.random() * 5000)).toLocaleString("es-ES");
    }
  </script>
</body>
</html>`
  },
];
