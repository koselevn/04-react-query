import { useState, useEffect } from 'react';
import toast, { Toaster } from 'react-hot-toast';
import ReactPaginate from 'react-paginate';
import SearchBar from '../SearchBar/SearchBar'
import css from './App.module.css'
import MovieGrid from '../MovieGrid/MovieGrid';
import ErrorMessage from '../ErrorMessage/ErrorMessage';
import Loader from '../Loader/Loader';
import MovieModal from '../MovieModal/MovieModal';
import type { Movie } from '../../types/movie';
import { fetchMovies } from '../../services/movieService';
import { useQuery, keepPreviousData } from '@tanstack/react-query';

const notify = () => toast('No movies found for your request.');

export default function App() {
  const [activeMovie, setActiveMovie] = useState<Movie | null>(null)
  const [query, setQuery] = useState('')
  const [currentPage, setCurrentPage] = useState(1)

  const { data, isLoading, isError, isSuccess } = useQuery({
    queryKey: ['movies', query, currentPage],
    queryFn: () => fetchMovies(query, currentPage),
    enabled: !!query,
    placeholderData: keepPreviousData,
  });

  useEffect(() => {
    if (data && data.results.length === 0) {
      notify()
    }
  }, [data])

  function onClose() {
    setActiveMovie(null)
  }

  function handleSelect(selected: Movie) {
    setActiveMovie(selected)
  }

  function handleSubmit(searchQuery: string) {
    setQuery(searchQuery)
    setCurrentPage(1)
  }

  return (
    <>
      <SearchBar onSubmit={handleSubmit} />
      {isError && <ErrorMessage isError={true} />}
      {isLoading && <Loader />}
      {isSuccess && data.total_pages > 1 && (
        <ReactPaginate
          pageCount={data.total_pages}
          pageRangeDisplayed={5}
          marginPagesDisplayed={1}
          onPageChange={({ selected }) => setCurrentPage(selected + 1)}
          forcePage={currentPage - 1}
          containerClassName={css.pagination}
          activeClassName={css.active}
          nextLabel="→"
          previousLabel="←"
        />
      )}
      {isSuccess && <MovieGrid movies={data.results} onSelect={handleSelect} />}
      <Toaster />
      {activeMovie && <MovieModal movie={activeMovie} onClose={onClose} />}
    </>
  )
}