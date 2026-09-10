import { Route, Routes } from 'react-router'
import Layout from './components/Layout'
import RequireOwner from './components/RequireOwner'
import About from './pages/About'
import Admin from './pages/Admin'
import AdminBuilds from './pages/AdminBuilds'
import Cabinet from './pages/Cabinet'
import Draw from './pages/Draw'
import Gifts from './pages/Gifts'
import NotFound from './pages/NotFound'
import Table from './pages/Table'

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Table />} />
        <Route path="draw" element={<Draw />} />
        <Route path="gifts" element={<Gifts />} />
        <Route path="cabinet" element={<Cabinet />} />
        <Route
          path="admin"
          element={
            <RequireOwner>
              <Admin />
            </RequireOwner>
          }
        />
        <Route
          path="admin/builds"
          element={
            <RequireOwner>
              <AdminBuilds />
            </RequireOwner>
          }
        />
        <Route path="about" element={<About />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  )
}
