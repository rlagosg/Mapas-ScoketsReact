import React, { useCallback, useEffect, useRef, useState } from 'react'
import mapboxgl, { Marker } from 'mapbox-gl'
import { v4 } from 'uuid'
import { Subject } from 'rxjs'

mapboxgl.accessToken = 'pk.eyJ1Ijoia2xlcml0aCIsImEiOiJja2dzOHdteDkwM2tnMndxMWhycnY3Ymh3In0.Zis8hP6HuwcywtgUhfeZoQ'

export const useMapbox = (puntoInicial) => {
  
    const mapaDiv = useRef();    
    const setRef = useCallback( (node) =>{
        mapaDiv.current = node;
    },[]);

    // Observables Rxjs
    const movimientoMarcador = useRef( new Subject() );
    const nuevoMarcador = useRef( new Subject() );

    // referencia a los marcadores
    const marcadores = useRef({});

    // mapa y coordenadas
    const mapa = useRef();
    const [coords, setCoords] = useState(puntoInicial);

    // funcion para agregar marcadores
    const agregarMarcador = useCallback( (ev, id) => {
        // obtengo las coordenas
        const { lat, lng } = ev.lngLat || ev;

        // creo el marcador
        const marker = new Marker();
        marker.id = id ?? v4();

        // Lo muestro en pantalla
        marker
            .setLngLat([lng, lat])
            .addTo(mapa.current)
            .setDraggable(true);  
        
        // Guardar la referencia del marcador
        marcadores.current[ marker.id ] = marker;

        if( !id ) {
          nuevoMarcador.current.next( {
              id: marker.id,
              lng,
              lat
          } );
        }

        // Escuchar movimientos del marcador
        marker.on('drag', ({ target }) => {
            const { id } = target;
            const { lng, lat } = target.getLngLat();
            movimientoMarcador.current.next({ id, lng, lat });
        });

    });

    // Funcion para actualizar la ubicacion el marcador
    const actualizarPosicion = useCallback( ({ id, lng, lat }) => {
      marcadores.current[id].setLngLat([ lng, lat ]);
    },[])



    useEffect(() => {
      const map = new mapboxgl.Map({
        container: mapaDiv.current,
        style: 'mapbox://styles/mapbox/streets-v11',
        center: [puntoInicial.lng, puntoInicial.lat],
        zoom: puntoInicial.zoom
      });

      mapa.current = map;
    }, [])

    //cuando se mueve el mapa
    useEffect(() => {
      mapa.current?.on('move', ()=>{
        const { lng, lat } = mapa.current.getCenter();
        
        setCoords({ 
          lng: lng.toFixed(4), 
          lat: lat.toFixed(4), 
          zoom: mapa.current.getZoom().toFixed(2)
        });

      })
    }, [])

    //agregar marcadores cuando hacemos clic
    useEffect(() => {
        mapa.current?.on('click', (ev) => {
            agregarMarcador(ev);
        });
    }, [agregarMarcador])
    

    return {
        actualizarPosicion,
        agregarMarcador,
        coords,
        marcadores,
        nuevoMarcador$: nuevoMarcador.current,
        movimientoMarcador$: movimientoMarcador.current,
        setRef,
    }

}
