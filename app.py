"""
BDR Workspace - Arquitectura de Navegación Lateral + Chat Centralizado
Identidad Corporativa BDR:
- primaryColor: #2a7b9b
- backgroundColor: #f5f5f5
- secondaryBackgroundColor: #dcf0fa
- textColor: #141413
"""

import streamlit as st
from datetime import datetime

# 1. Configuración de página
st.set_page_config(
    page_title="BDR Workspace",
    page_icon="🔷",
    layout="wide",
    initial_sidebar_state="expanded",
)

# 2. Inyección de CSS Personalizado
# - Oculta encabezados y pie de página de Streamlit
# - Restringe el ancho máximo del contenedor central y de la caja de chat_input a 800px
# - Estiliza el sidebar, las burbujas de chat y el estado vacío
st.markdown(
    """
    <style>
    /* Ocultar elementos nativos de Streamlit */
    header[data-testid="stHeader"] {
        display: none !important;
    }
    footer {
        display: none !important;
    }
    #MainMenu {
        display: none !important;
    }

    /* Fondo principal y tipografía */
    body, .stApp {
        background-color: #f5f5f5 !important;
        color: #141413 !important;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif !important;
    }

    /* Quitar padding superior excesivo */
    .block-container {
        padding-top: 1.5rem !important;
        padding-bottom: 7rem !important;
        padding-left: 1rem !important;
        padding-right: 1rem !important;
        max-width: 820px !important;
        margin-left: auto !important;
        margin-right: auto !important;
    }

    /* Scrollbars estilizados marca BDR */
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

    /* Estilización del Sidebar nativo de Streamlit */
    [data-testid="stSidebar"] {
        background-color: #ffffff !important;
        border-right: 1px solid #e2e8f0 !important;
        padding-top: 0.5rem !important;
    }
    [data-testid="stSidebar"] .block-container {
        padding-top: 1rem !important;
        padding-bottom: 1rem !important;
        max-width: 100% !important;
    }

    /* Botón 'Nuevo Chat' en Sidebar */
    .stSidebar button[kind="primary"] {
        background-color: #2a7b9b !important;
        color: #ffffff !important;
        border-radius: 10px !important;
        border: none !important;
        font-weight: 600 !important;
        width: 100% !important;
        padding: 0.55rem 1rem !important;
        box-shadow: 0 2px 8px rgba(42, 123, 155, 0.2) !important;
        transition: background 0.2s ease !important;
    }
    .stSidebar button[kind="primary"]:hover {
        background-color: #1f5f78 !important;
    }

    /* Botones secundarios y elementos de lista en el sidebar */
    .stSidebar button[kind="secondary"] {
        background-color: transparent !important;
        color: #141413 !important;
        border: 1px solid transparent !important;
        border-radius: 8px !important;
        text-align: left !important;
        justify-content: flex-start !important;
        padding: 0.4rem 0.6rem !important;
        font-size: 0.88rem !important;
        font-weight: 500 !important;
    }
    .stSidebar button[kind="secondary"]:hover {
        background-color: #dcf0fa !important;
        color: #2a7b9b !important;
    }

    /* Estilo de los mensajes del chat */
    .stChatMessage {
        background-color: transparent !important;
        padding: 0.8rem 0 !important;
        max-width: 800px !important;
        margin: 0 auto !important;
    }
    [data-testid="stChatMessageContent"] {
        border-radius: 14px !important;
        padding: 0.85rem 1.15rem !important;
        font-size: 0.95rem !important;
        line-height: 1.6 !important;
        box-shadow: 0 1px 3px rgba(0,0,0,0.03) !important;
    }
    /* Mensajes del usuario: Fondo azul pastel BDR */
    div[data-testid="stChatMessage"]:has(div[aria-label="Chat message from user"]) [data-testid="stChatMessageContent"] {
        background-color: #dcf0fa !important;
        border: 1px solid rgba(42, 123, 155, 0.2) !important;
        color: #141413 !important;
    }
    /* Mensajes del asistente: Tarjeta blanca limpia */
    div[data-testid="stChatMessage"]:has(div[aria-label="Chat message from assistant"]) [data-testid="stChatMessageContent"] {
        background-color: #ffffff !important;
        border: 1px solid #e5e7eb !important;
        color: #141413 !important;
    }

    /* Contenedor flotante de entrada (st.chat_input) */
    /* Ancho máximo restringido a 800px y centrado horizontalmente */
    [data-testid="stChatInput"] {
        max-width: 800px !important;
        margin: 0 auto !important;
        background: #ffffff !important;
        border: 1.5px solid #dcf0fa !important;
        border-radius: 18px !important;
        box-shadow: 0 10px 30px rgba(42, 123, 155, 0.12) !important;
        padding: 0.35rem 0.6rem !important;
        transition: border-color 0.2s ease, box-shadow 0.2s ease !important;
    }
    [data-testid="stChatInput"]:focus-within {
        border-color: #2a7b9b !important;
        box-shadow: 0 10px 32px rgba(42, 123, 155, 0.2) !important;
    }
    [data-testid="stChatInput"] textarea {
        color: #141413 !important;
        font-size: 0.95rem !important;
    }
    </style>
    """,
    unsafe_allow_html=True,
)

# 3. Inicialización del Estado de la Sesión
if "messages" not in st.session_state:
    st.session_state.messages = []

if "selected_project" not in st.session_state:
    st.session_state.selected_project = "General"

if "recent_chats" not in st.session_state:
    st.session_state.recent_chats = [
        {"id": "c1", "title": "Análisis de ventas Q3", "pinned": True, "date": "Hoy"},
        {"id": "c2", "title": "Resumen ejecutivo BDR", "pinned": True, "date": "Ayer"},
        {"id": "c3", "title": "Revisión técnica de API", "pinned": False, "date": "Hace 3 días"},
        {"id": "c4", "title": "Estrategia de marca BDR", "pinned": False, "date": "Hace 5 días"},
    ]


# 4. BARRA LATERAL NATIVA (st.sidebar)
with st.sidebar:
    # Header de Marca
    st.markdown(
        """
        <div style="display: flex; align-items: center; gap: 10px; padding-bottom: 0.8rem; margin-bottom: 0.5rem; border-bottom: 1px solid #e2e8f0;">
            <div style="background: #2a7b9b; color: white; font-weight: 900; font-size: 15px; padding: 5px 12px; border-radius: 8px; letter-spacing: 0.8px;">
                🔷
            </div>
        </div>
        """,
        unsafe_allow_html=True,
    )

    # Botón de Nuevo Chat
    if st.button("➕ Nuevo chat", type="primary", use_container_width=True):
        st.session_state.messages = []
        st.rerun()

    st.markdown("<div style='height: 10px;'></div>", unsafe_allow_html=True)

    # Selector de Proyectos (Desplegable)
    st.markdown("<p style='font-size: 11px; font-weight: 700; color: #5e6d75; text-transform: uppercase; margin-bottom: 4px;'>Proyectos</p>", unsafe_allow_html=True)
    project_list = ["General", "Operaciones BDR", "Finanzas & Reporting", "Desarrollo de Producto"]
    selected = st.selectbox(
        label="Proyecto Activo",
        options=project_list,
        index=project_list.index(st.session_state.selected_project),
        label_visibility="collapsed",
    )
    st.session_state.selected_project = selected

    st.markdown("<div style='height: 14px;'></div>", unsafe_allow_html=True)

    # Sección de Chats Fijados
    st.markdown("<p style='font-size: 11px; font-weight: 700; color: #5e6d75; text-transform: uppercase; margin-bottom: 4px;'>📌 Fijados</p>", unsafe_allow_html=True)
    for chat in [c for c in st.session_state.recent_chats if c["pinned"]]:
        if st.button(f"{chat['title']}", key=f"pin_{chat['id']}", use_container_width=True, type="secondary"):
            st.session_state.messages = [
                {"role": "user", "content": f"Abrir chat: {chat['title']}", "timestamp": "10:30"},
                {"role": "assistant", "content": f"Has reanudado el chat **{chat['title']}** dentro del proyecto **{st.session_state.selected_project}**.", "timestamp": "10:31"},
            ]
            st.rerun()

    st.markdown("<div style='height: 14px;'></div>", unsafe_allow_html=True)

    # Sección de Chats Recientes y Tareas
    st.markdown("<p style='font-size: 11px; font-weight: 700; color: #5e6d75; text-transform: uppercase; margin-bottom: 4px;'>🕒 Recientes</p>", unsafe_allow_html=True)
    for chat in [c for c in st.session_state.recent_chats if not c["pinned"]]:
        if st.button(f"{chat['title']}", key=f"recent_{chat['id']}", use_container_width=True, type="secondary"):
            st.session_state.messages = [
                {"role": "user", "content": f"Abrir chat: {chat['title']}", "timestamp": "11:00"},
                {"role": "assistant", "content": f"Has reanudado el chat **{chat['title']}**.", "timestamp": "11:01"},
            ]
            st.rerun()


# 5. ÁREA PRINCIPAL: PANEL DE CHAT CENTRAL (Max-Width: 800px)

# Caso A: ESTADO VACÍO (Empty State / Momento Hero)
if len(st.session_state.messages) == 0:
    st.markdown(
        """
        <div style="text-align: center; margin-top: 7vh; margin-bottom: 2.5rem;">
            <div style="display: inline-flex; align-items: center; justify-content: center; width: 64px; height: 64px; border-radius: 18px; background: #2a7b9b; color: white; font-size: 26px; font-weight: 900; letter-spacing: 1px; box-shadow: 0 8px 24px rgba(42, 123, 155, 0.22); margin-bottom: 1.5rem;">
                BDR
            </div>
            <h1 style="font-size: 2.1rem; font-weight: 700; color: #141413; margin-bottom: 0.6rem; letter-spacing: -0.02em;">
                ¡Hola! ¿En qué te ayudo hoy?
            </div>
            <p style="font-size: 1rem; color: #5e6d75; max-width: 480px; margin: 0 auto; line-height: 1.5;">
                Selecciona una tarea frecuente o escribe una consulta para comenzar a colaborar con el sistema BDR.
            </p>
        </div>
        """,
        unsafe_allow_html=True,
    )

    # Tarjetas de Sugerencias Centradas (Hero Cards)
    col1, col2 = st.columns(2)
    with col1:
        if st.button("📊 Analizar métricas ejecutivas\n\nResumen de KPIs financieros y rendimiento operativo BDR", use_container_width=True):
            st.session_state.messages.append({
                "role": "user",
                "content": "Analizar métricas ejecutivas de BDR",
                "timestamp": datetime.now().strftime("%H:%M"),
            })
            st.session_state.messages.append({
                "role": "assistant",
                "content": "Aquí tienes el desglose de métricas ejecutivas para la marca **BDR**:\n\n- **Ingresos YTD:** € 1.284.950 (+14.2% respecto a objetivo)\n- **Clientes Activos:** 3.420 (Retención: 96.4%)\n- **Eficiencia Operativa:** 94.8%\n\n¿Deseas profundizar en alguna de las divisiones de negocio?",
                "timestamp": datetime.now().strftime("%H:%M"),
            })
            st.rerun()

    with col2:
        if st.button("📝 Redactar propuesta corporativa\n\nPlantilla formal adaptada a los estándares de marca BDR", use_container_width=True):
            st.session_state.messages.append({
                "role": "user",
                "content": "Redactar propuesta corporativa con estándares BDR",
                "timestamp": datetime.now().strftime("%H:%M"),
            })
            st.session_state.messages.append({
                "role": "assistant",
                "content": "He preparado una estructura de propuesta corporativa BDR:\n\n1. **Resumen Ejecutivo**: Alcance de la alianza estratégica.\n2. **Propuesta de Valor BDR**: Metodología y ventajas clave.\n3. **Cronograma y Entregables**: Hitos de cumplimiento mensual.\n4. **Presupuesto y Condiciones**.\n\n¿Sobre qué servicio o cliente específico trabajaremos hoy?",
                "timestamp": datetime.now().strftime("%H:%M"),
            })
            st.rerun()

# Caso B: HISTORIAL DE CONVERSACIÓN ACTIVO
else:
    for msg in st.session_state.messages:
        with st.chat_message(msg["role"]):
            st.markdown(msg["content"])
            if "timestamp" in msg:
                st.markdown(
                    f"<div style='text-align: right; font-size: 10px; color: #8c9ba5; margin-top: 4px;'>{msg['timestamp']}</div>",
                    unsafe_allow_html=True,
                )


# 6. CAJA DE ENTRADA FLOTANTE CENTRADA (st.chat_input)
# La inyección CSS en la cabecera asegura max-width: 800px y centrado automático
user_input = st.chat_input("Escribe un mensaje para BDR...")

if user_input:
    now_str = datetime.now().strftime("%H:%M")

    # 1. Registrar mensaje del usuario
    st.session_state.messages.append({
        "role": "user",
        "content": user_input,
        "timestamp": now_str,
    })

    # 2. Lógica de respuesta del asistente
    query_clean = user_input.lower().strip()
    if "dashboard" in query_clean or "métrica" in query_clean:
        reply_content = (
            f"He preparado el informe de métricas para el proyecto **{st.session_state.selected_project}**:\n\n"
            f"• **Facturación total**: € 1.284.950 (+14.2%)\n"
            f"• **Clientes activos**: 3.420\n"
            f"• **Tiempo de ciclo operativo**: 1.2 días\n\n"
            f"Todos los valores han sido normalizados con el sistema corporativo BDR."
        )
    elif "propuesta" in query_clean:
        reply_content = (
            f"Propuesta en borrador generada para **{st.session_state.selected_project}**.\n\n"
            f"Se han aplicado las directrices cromáticas corporativas (#2a7b9b) y tipografía Sans-Serif acorde al manual BDR."
        )
    else:
        reply_content = (
            f"Entendido. He procesado tu solicitud en el contexto del proyecto **'{st.session_state.selected_project}'**.\n\n"
            f"¿En qué otro detalle o documento te gustaría que continuemos trabajando?"
        )

    st.session_state.messages.append({
        "role": "assistant",
        "content": reply_content,
        "timestamp": datetime.now().strftime("%H:%M"),
    })

    st.rerun()
