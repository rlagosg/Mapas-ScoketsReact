import React, { useContext, useEffect } from 'react'
import { useMapbox } from '../hooks/useMapbox'
import { SocketContext } from '../context/SocketContext';

//municipalidad de comayagua
//14.460800129043308, -87.64127614541654
const puntoInicial = {
  lat: 14.4605,
  lng: -87.6411,
  zoom: 18
}

export const MapaPage = () => {

    const {coords, setRef, nuevoMarcador$, movimientoMarcador$, agregarMarcador, actualizarPosicion } = useMapbox( puntoInicial );

    const { socket } = useContext( SocketContext );

    // Escuchar los marcadores existentes
    useEffect(() => {
      socket.on('marcadores-activos', (marcadores) => {
        for( const key of Object.keys( marcadores )){
          agregarMarcador( marcadores[key], key );          
        }
      })
    }, [socket, agregarMarcador])
    

    // Nuevo marcador
    useEffect(() => {
      nuevoMarcador$.subscribe((marcador) => {
          socket.emit('marcador-nuevo', marcador);
      });
    }, [nuevoMarcador$, socket])

    // Movimiento de marcador
    useEffect(() => {
      movimientoMarcador$.subscribe((marcador) => {
          socket.emit('marcador-actualizado', marcador);
      });
    }, [socket, movimientoMarcador$])

    // Mover marcador mediante sockets
    useEffect(() => {
      socket.on('marcador-actualizado', (marcador) => {
        actualizarPosicion( marcador );
      });

    }, [socket, actualizarPosicion])
    

    useEffect(() => {
      socket.on('marcador-nuevo', (marcador) => {
        agregarMarcador(marcador, marcador.id);
      }); 

    }, [socket, agregarMarcador])
    

    return (
        <>
        <div className='info'>
          Lng: {coords.lng} | Lat: {coords.lat} | zoom: {coords.zoom}
        </div>
            <div className='mapContainer'
            ref={ setRef }/>
        </>
    )
}
