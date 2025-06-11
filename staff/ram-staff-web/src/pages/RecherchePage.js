import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { BACKEND_URL, auth } from '../firebase';
import { MagnifyingGlassIcon, ArrowRightCircleIcon, ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';

function FadeInDiv({ children, delay = 0, className = "" }) {
  return (
    <div
      className={"opacity-0 translate-y-4 animate-fadeInUp " + className}
      style={{
        animationDelay: `${delay}ms`,
        animationFillMode: "forwards",
        animationDuration: "600ms",
        animationTimingFunction: "cubic-bezier(0.23, 1, 0.32, 1)",
      }}
    >
      {children}
    </div>
  );
}

const ITEMS_PER_PAGE = 5;

export default function RecherchePage() {
  const [voyages, setVoyages] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPageCount, setTotalPageCount] = useState(1);

  // Fonction pour fetch les voyages (pagination & recherche côté serveur)
  const fetchVoyages = async () => {
    const user = auth.currentUser;
    if (!user) return;
    try {
      const token = await user.getIdToken();
      const res = await axios.get(`${BACKEND_URL}/voyages/staff`, {
        headers: { Authorization: `Bearer ${token}` },
        params: { page: currentPage - 1, size: ITEMS_PER_PAGE, search }
      });
      setVoyages(res.data.content);
      setTotalPageCount(res.data.totalPages || 1);
    } catch (err) {
      setVoyages([]);
      console.error("❌ Erreur fetch voyages :", err);
    } finally {
      setLoading(false);
    }
  };

  // Effet : fetch data au chargement puis lors des changements de page ou recherche
  useEffect(() => {
    fetchVoyages();
    const interval = setInterval(fetchVoyages, 5000);
    return () => clearInterval(interval);
    // eslint-disable-next-line
  }, [currentPage, search]);

  const handleSearch = (value) => {
    setSearch(value);
    setCurrentPage(1);
  };

  return (
    <div
      className="min-h-screen font-sans"
      style={{
        background: "#F5F6FA",
        fontFamily: 'Montserrat, Arial, sans-serif'
      }}
    >
      {/* Header */}
      <FadeInDiv delay={80}>
        <div
          className="flex items-end justify-between px-7 pt-7 pb-2 bg-white border-b"
          style={{
            minHeight: 50,
            borderBottom: "1.5px solid #ececec",
            marginLeft: -8,
            paddingRight: 24,
            fontFamily: 'Montserrat, Arial, sans-serif',
          }}
        >
          <div>
            <div className="flex items-center gap-2">
              <h1
                className="text-xl font-bold uppercase"
                style={{
                  color: "#C4002A",
                  letterSpacing: '1px',
                }}
              >
                Tableau des vols
              </h1>
              <span
                className="bg-white border border-[#ebc4c7] text-[#C4002A] font-semibold text-xs px-3 py-[3px] rounded ml-2 tracking-wide"
                style={{
                  borderRadius: 2,
                  letterSpacing: "1.2px"
                }}
              >
                STAFF
              </span>
            </div>
            <div
              className="h-[2px] w-12 mt-1"
              style={{ backgroundColor: '#C4002A', opacity: 0.12 }}
            />
          </div>
          <div className="text-xs text-gray-400 font-normal select-none px-3 py-1" style={{ fontFamily: 'Montserrat, Arial, sans-serif' }}>
            {voyages.length} vol{voyages.length > 1 ? 's' : ''} trouvé{voyages.length > 1 ? 's' : ''}
          </div>
        </div>
      </FadeInDiv>

      {/* Search bar */}
      <FadeInDiv delay={180}>
        <div className="w-full flex flex-col gap-2 px-7 py-3" style={{ background: "#F5F6FA", borderBottom: "1px solid #ececec" }}>
          <div className="
            flex items-center gap-2 w-full max-w-lg px-3 py-1 bg-white
            border border-[#ececec]
            focus-within:border-[#ececec]
            transition-all
            ring-0
            rounded-none
            shadow-none
          ">
            <MagnifyingGlassIcon className="h-5 w-5 text-ramRed" />
            <input
              type="text"
              value={search}
              onChange={e => handleSearch(e.target.value)}
              placeholder="Rechercher"
              className="
                w-full bg-transparent text-[15px] border-none outline-none
                font-medium text-ramText placeholder-[#b9b8b8]
                focus:outline-none focus:border-none focus:ring-0
                transition-colors
              "
              spellCheck={false}
              style={{
                fontFamily: 'Montserrat, Arial, sans-serif',
                height: 28,
                lineHeight: "1.2",
                borderRadius: 0,
              }}
            />
          </div>
          {/* Filtres supprimés : pagination et recherche sont gérées côté serveur */}
        </div>
      </FadeInDiv>

      {/* Table */}
      <FadeInDiv delay={300}>
        <div className="p-2 md:p-10 pt-7">
          <div className="overflow-x-auto border border-[#ececec] bg-white animate-fadeIn rounded-none shadow-none">
            <table className="min-w-full text-[15px] font-medium" style={{ fontFamily: 'Montserrat, Arial, sans-serif' }}>
              <thead>
                <tr
                  className="font-bold uppercase text-xs tracking-wide select-none"
                  style={{
                    background: '#C4002A',
                    color: '#fff',
                    userSelect: 'none',
                    cursor: 'default',
                  }}
                >
                  <th className="px-4 py-3 text-left font-semibold whitespace-nowrap">PNR</th>
                  <th className="px-4 py-3 text-left font-semibold whitespace-nowrap">N° VOL</th>
                  <th className="px-4 py-3 text-left font-semibold whitespace-nowrap">NOM COMPLET</th>
                  <th className="px-4 py-3 text-left font-semibold whitespace-nowrap">DÉPART</th>
                  <th className="px-4 py-3 text-left font-semibold whitespace-nowrap">ARRIVÉE</th>
                  <th className="px-4 py-3 text-left font-semibold whitespace-nowrap">DATE</th>
                  <th className="px-4 py-3 text-left font-semibold whitespace-nowrap">HEURE</th>
                  <th className="px-4 py-3 text-center"></th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={8} className="py-16 text-center text-ramRed font-semibold text-base">
                      Chargement...
                    </td>
                  </tr>
                ) : voyages.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-16 text-center text-[#b1afaf] italic">
                      Aucun vol trouvé.
                    </td>
                  </tr>
                ) : (
                  voyages.map((v, i) => (
                    <tr
                      key={v.id}
                      className={`
                        border-b border-[#ececec]
                        bg-white group
                        hover:bg-[#F8E6EA]/55
                        cursor-pointer
                        transition-colors
                      `}
                      style={{
                        transition: "background 0.14s cubic-bezier(0.23, 1, 0.32, 1)"
                      }}
                      onClick={() => window.location.href = `/voyage/${v.id}`}
                    >
                      <td className="px-4 py-3 font-semibold text-ramRed">{v.pnr}</td>
                      <td className="px-4 py-3">{v.numeroVol}</td>
                      <td className="px-4 py-3">{v.nom} {v.prenom}</td>
                      <td className="px-4 py-3">{v.villeDepart}</td>
                      <td className="px-4 py-3">{v.villeArrivee}</td>
                      <td className="px-4 py-3">{v.date}</td>
                      <td className="px-4 py-3">{v.heure}</td>
                      <td className="px-2 py-3 text-center">
                        <span className="opacity-0 group-hover:opacity-100 transition">
                          <ArrowRightCircleIcon className="h-5 w-5 text-ramRed transition-transform group-hover:scale-110" />
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          {/* Pagination */}
          <div className="flex justify-center items-center mt-7 gap-2 animate-fadeIn">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className={`flex items-center px-3 py-2 rounded-full border transition shadow-sm bg-white border-[#ececec] hover:border-ramRed hover:bg-[#f7e8ea] active:scale-95
                ${currentPage === 1 ? "opacity-50 cursor-not-allowed" : ""}
              `}
              style={{ marginRight: 8, transition: "all 0.2s cubic-bezier(0.23, 1, 0.32, 1)" }}
            >
              <ChevronLeftIcon className="h-5 w-5 mr-1 text-ramRed" />
              Précédent
            </button>
            <div className="font-medium text-[15px] px-4 select-none" style={{ color: "#C4002A", letterSpacing: 1 }}>
              Page {currentPage} / {totalPageCount || 1}
            </div>
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPageCount, p + 1))}
              disabled={currentPage === totalPageCount || totalPageCount === 0}
              className={`flex items-center px-3 py-2 rounded-full border transition shadow-sm bg-white border-[#ececec] hover:border-ramRed hover:bg-[#f7e8ea] active:scale-95
                ${currentPage === totalPageCount || totalPageCount === 0 ? "opacity-50 cursor-not-allowed" : ""}
              `}
              style={{ marginLeft: 8, transition: "all 0.2s cubic-bezier(0.23, 1, 0.32, 1)" }}
            >
              Suivant
              <ChevronRightIcon className="h-5 w-5 ml-1 text-ramRed" />
            </button>
          </div>
        </div>
      </FadeInDiv>
    </div>
  );
}
