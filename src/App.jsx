import { useState } from 'react'
import './App.css'

function App() {
  const apiUrl = window.__CONFIG__?.VITE_API_URL || import.meta.env.VITE_API_URL || ''

  const [vistaActual, setVistaActual] = useState('listados') 
  const [tipoListado, setTipoListado] = useState('CENTRO') 
  const [listado, setListado] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [mensaje, setMensaje] = useState(null)

  const [favoritos, setFavoritos] = useState([])
  const [loadingFavoritos, setLoadingFavoritos] = useState(false)

  const fetchListado = async () => {
    setLoading(true)
    setError(null)
    setMensaje(null)
    try {
      const endpoint = tipoListado === 'CENTRO' ? '/api/surcusales' : '/api/sipap?dominio=motivos-sipap'
      const response = await fetch(`${apiUrl}${endpoint}`)
      if (!response.ok) {
        throw new Error(`Error: ${response.status}`)
      }
      const data = await response.json()
      setListado(data.ubicaciones || data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const guardarEnFavoritos = async (item) => {
    setMensaje(null)
    setError(null)
    try {
      let descripcion, referenciaId
      
      if (tipoListado === 'CENTRO') {
        descripcion = item.nombre || item.titulo || 'Sin nombre'
        referenciaId = `CENTRO-${item.nombre || item.titulo || 'unknown'}-${item.ciudad || 'unknown'}`.replace(/\s+/g, '-')
      } else {
        descripcion = item.motivo
        referenciaId = `SIPAP-${item.codigoMotivo}`
      }
      
      const response = await fetch(`${apiUrl}/api/favoritos`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tipo: tipoListado,
          descripcion: descripcion,
          referenciaId: referenciaId,
          fechaRegistro: new Date().toISOString()
        })
      })

      if (!response.ok) {
        if (response.status === 409) {
          throw new Error('Este elemento ya está en favoritos')
        }
        throw new Error(`Error: ${response.status}`)
      }

      setMensaje('Guardado en favoritos correctamente')
      setTimeout(() => setMensaje(null), 3000)
    } catch (err) {
      setError(err.message)
      setTimeout(() => setError(null), 3000)
    }
  }

  const fetchFavoritos = async () => {
    setLoadingFavoritos(true)
    setError(null)
    try {
      const response = await fetch(`${apiUrl}/api/favoritos`)
      if (!response.ok) {
        throw new Error(`Error: ${response.status}`)
      }
      const data = await response.json()
      setFavoritos(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoadingFavoritos(false)
    }
  }

  const irAFavoritos = () => {
    setVistaActual('favoritos')
    fetchFavoritos()
  }

  return (
    <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      
      <div style={{ marginBottom: '2rem', display: 'flex', gap: '1rem' }}>
        <button 
          onClick={() => setVistaActual('listados')}
          style={{
            padding: '0.5rem 1rem',
            background: vistaActual === 'listados' ? '#646cff' : '#555',
            border: 'none',
            borderRadius: '4px',
            color: 'white',
            cursor: 'pointer'
          }}
        >
          Listados
        </button>
        <button 
          onClick={irAFavoritos}
          style={{
            padding: '0.5rem 1rem',
            background: vistaActual === 'favoritos' ? '#646cff' : '#555',
            border: 'none',
            borderRadius: '4px',
            color: 'white',
            cursor: 'pointer'
          }}
        >
          Favoritos
        </button>
      </div>

      {/* Vista de Listados */}
      {vistaActual === 'listados' && (
        <div>
          <h2>Listados</h2>

          {/* Dropdown para seleccionar tipo */}
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ marginRight: '1rem' }}>
              Seleccionar:
              <select 
                value={tipoListado} 
                onChange={(e) => setTipoListado(e.target.value)}
                style={{ marginLeft: '0.5rem', padding: '0.5rem' }}
              >
                <option value="CENTRO">CENTRO</option>
                <option value="SIPAP">SIPAP</option>
              </select>
            </label>
            <button 
              onClick={fetchListado}
              disabled={loading}
              style={{
                padding: '0.5rem 1rem',
                background: '#646cff',
                border: 'none',
                borderRadius: '4px',
                color: 'white',
                cursor: 'pointer'
              }}
            >
              {loading ? 'Cargando...' : 'Cargar'}
            </button>
          </div>

          {/* Mensajes */}
          {mensaje && <p style={{ color: 'green' }}>{mensaje}</p>}
          {error && <p style={{ color: 'red' }}>Error: {error}</p>}

          {/* Listado */}
          {listado.length > 0 && (
            <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '1rem' }}>
              <thead>
                <tr style={{ background: '#333' }}>
                  {tipoListado === 'CENTRO' ? (
                    <>
                      <th style={{ padding: '0.5rem', border: '1px solid #555' }}>Nombre</th>
                      <th style={{ padding: '0.5rem', border: '1px solid #555' }}>Tipo</th>
                      <th style={{ padding: '0.5rem', border: '1px solid #555' }}>Ciudad</th>
                    </>
                  ) : (
                    <>
                      <th style={{ padding: '0.5rem', border: '1px solid #555' }}>Código</th>
                      <th style={{ padding: '0.5rem', border: '1px solid #555' }}>Motivo</th>
                    </>
                  )}
                  <th style={{ padding: '0.5rem', border: '1px solid #555' }}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {listado.map((item, index) => (
                  <tr key={index}>
                    {tipoListado === 'CENTRO' ? (
                      <>
                        <td style={{ padding: '0.5rem', border: '1px solid #555' }}>
                          {item.nombre || item.titulo || 'Sin nombre'}
                        </td>
                        <td style={{ padding: '0.5rem', border: '1px solid #555' }}>
                          {item.tipo || '-'}
                        </td>
                        <td style={{ padding: '0.5rem', border: '1px solid #555' }}>
                          {item.ciudad || '-'}
                        </td>
                      </>
                    ) : (
                      <>
                        <td style={{ padding: '0.5rem', border: '1px solid #555' }}>
                          {item.codigoMotivo}
                        </td>
                        <td style={{ padding: '0.5rem', border: '1px solid #555' }}>
                          {item.motivo}
                        </td>
                      </>
                    )}
                    <td style={{ padding: '0.5rem', border: '1px solid #555', textAlign: 'center' }}>
                      <button
                        onClick={() => guardarEnFavoritos(item)}
                        style={{
                          padding: '0.25rem 0.75rem',
                          background: '#10b981',
                          border: 'none',
                          borderRadius: '4px',
                          color: 'white',
                          cursor: 'pointer'
                        }}
                      >
                        Guardar en Favoritos
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* Vista de Favoritos */}
      {vistaActual === 'favoritos' && (
        <div>
          <h2>Mis Favoritos</h2>

          {loadingFavoritos && <p>Cargando favoritos...</p>}
          {error && <p style={{ color: 'red' }}>Error: {error}</p>}

          {favoritos.length === 0 && !loadingFavoritos && (
            <p>No hay favoritos guardados</p>
          )}

          {favoritos.length > 0 && (
            <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '1rem' }}>
              <thead>
                <tr style={{ background: '#333' }}>
                  <th style={{ padding: '0.5rem', border: '1px solid #555' }}>Tipo</th>
                  <th style={{ padding: '0.5rem', border: '1px solid #555' }}>Nombre</th>
                  <th style={{ padding: '0.5rem', border: '1px solid #555' }}>Fecha</th>
                </tr>
              </thead>
              <tbody>
                {favoritos.map((fav, index) => (
                  <tr key={index}>
                    <td style={{ padding: '0.5rem', border: '1px solid #555' }}>
                      {fav.tipo}
                    </td>
                    <td style={{ padding: '0.5rem', border: '1px solid #555' }}>
                      {fav.descripcion}
                    </td>
                    <td style={{ padding: '0.5rem', border: '1px solid #555' }}>
                      {fav.fechaCreacion ? new Date(fav.fechaCreacion).toLocaleDateString() : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

    </div>
  )
}

export default App
