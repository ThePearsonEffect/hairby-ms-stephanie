import { useState, useEffect } from 'react'
import { User, Lock, Edit3, Save, X, Menu, ArrowUp } from 'lucide-react'
import './App.css'

interface Content {
  hero_title: string
  hero_subtitle: string
  hero_description: string
  about_title: string
  about_description: string
  services: Array<{
    name: string
    description: string
  }>
}

function App() {
  const [content, setContent] = useState<Content | null>(null)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [showLogin, setShowLogin] = useState(false)
  const [editMode, setEditMode] = useState(false)
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [token, setToken] = useState('')
  const [editingContent, setEditingContent] = useState<Content | null>(null)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [showBackToTop, setShowBackToTop] = useState(false)

  const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'

  useEffect(() => {
    const fetchContentData = async () => {
      try {
        const response = await fetch(`${API_BASE}/content`)
        const data = await response.json()
        setContent(data)
        setEditingContent(data)
      } catch (error) {
        console.error('Error fetching content:', error)
      }
    }
    
    fetchContentData()
    
    // Back to top button visibility
    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 400)
    }
    
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [API_BASE])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const response = await fetch(`${API_BASE}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      })
      
      if (response.ok) {
        const data = await response.json()
        setToken(data.access_token)
        setIsLoggedIn(true)
        setShowLogin(false)
        setUsername('')
        setPassword('')
      } else {
        alert('Invalid credentials')
      }
    } catch (error) {
      console.error('Login error:', error)
      alert('Login failed')
    }
  }

  const handleSaveContent = async () => {
    if (!editingContent || !token) return

    try {
      for (const [key, value] of Object.entries(editingContent)) {
        if (key !== 'services') {
          await fetch(`${API_BASE}/content`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({ key, value }),
          })
        }
      }

      await fetch(`${API_BASE}/services`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ services: editingContent.services }),
      })

      setContent(editingContent)
      setEditMode(false)
      alert('Content updated successfully!')
    } catch (error) {
      console.error('Error saving content:', error)
      alert('Failed to save content')
    }
  }

  const handleLogout = () => {
    setIsLoggedIn(false)
    setToken('')
    setEditMode(false)
  }

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    })
  }

  if (!content) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-lg text-gray-600">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <a href="#hero" className="text-2xl font-serif text-gray-900 hover:text-gray-700 transition-colors">
                Hair by Ms. Stephanie
              </a>
            </div>
            <nav className="hidden md:flex space-x-8">
              <a href="#hero" className="text-gray-700 hover:text-gray-900 transition-colors">Home</a>
              <a href="#services" className="text-gray-700 hover:text-gray-900 transition-colors">Services</a>
              <a href="#about" className="text-gray-700 hover:text-gray-900 transition-colors">About</a>
              <a href="#portfolio" className="text-gray-700 hover:text-gray-900 transition-colors">Portfolio</a>
              <a href="#contact" className="text-gray-700 hover:text-gray-900 transition-colors">Contact</a>
            </nav>
            
            {/* Mobile menu button */}
            <div className="md:hidden">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="text-gray-700 hover:text-gray-900 transition-colors p-2"
              >
                <Menu size={24} />
              </button>
            </div>
            
            <div className="hidden md:flex items-center space-x-4">
              {isLoggedIn ? (
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setEditMode(!editMode)}
                    className="flex items-center space-x-1 px-3 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                  >
                    <Edit3 size={16} />
                    <span>{editMode ? 'Cancel' : 'Edit'}</span>
                  </button>
                  {editMode && (
                    <button
                      onClick={handleSaveContent}
                      className="flex items-center space-x-1 px-3 py-2 text-sm bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                    >
                      <Save size={16} />
                      <span>Save</span>
                    </button>
                  )}
                  <button
                    onClick={handleLogout}
                    className="flex items-center space-x-1 px-3 py-2 text-sm bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
                  >
                    <X size={16} />
                    <span>Logout</span>
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setShowLogin(true)}
                  className="flex items-center space-x-1 px-4 py-2 text-sm bg-gray-900 text-white rounded-md hover:bg-gray-800 transition-colors"
                >
                  <User size={16} />
                  <span>Admin Login</span>
                </button>
              )}
            </div>
          </div>
        </div>
        
        {/* Mobile Navigation Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200 bg-white">
            <div className="px-2 pt-2 pb-3 space-y-1">
              <a 
                href="#hero" 
                className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-md transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                Home
              </a>
              <a 
                href="#services" 
                className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-md transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                Services
              </a>
              <a 
                href="#about" 
                className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-md transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                About
              </a>
              <a 
                href="#portfolio" 
                className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-md transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                Portfolio
              </a>
              <a 
                href="#contact" 
                className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-md transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                Contact
              </a>
            </div>
          </div>
        )}
      </header>

      {/* Hero Section */}
      <section id="hero" className="relative bg-gray-50 py-24 lg:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              {editMode ? (
                <div className="space-y-4">
                  <input
                    type="text"
                    value={editingContent?.hero_title || ''}
                    onChange={(e) => setEditingContent(prev => prev ? {...prev, hero_title: e.target.value} : null)}
                    className="w-full text-4xl lg:text-6xl font-serif text-gray-900 bg-white border border-gray-300 rounded-md px-3 py-2"
                  />
                  <input
                    type="text"
                    value={editingContent?.hero_subtitle || ''}
                    onChange={(e) => setEditingContent(prev => prev ? {...prev, hero_subtitle: e.target.value} : null)}
                    className="w-full text-xl lg:text-2xl text-gray-600 bg-white border border-gray-300 rounded-md px-3 py-2"
                  />
                  <textarea
                    value={editingContent?.hero_description || ''}
                    onChange={(e) => setEditingContent(prev => prev ? {...prev, hero_description: e.target.value} : null)}
                    className="w-full text-lg text-gray-700 bg-white border border-gray-300 rounded-md px-3 py-2 h-24"
                  />
                </div>
              ) : (
                <>
                  <h1 className="text-4xl lg:text-6xl font-serif text-gray-900 mb-6">
                    {content.hero_title}
                  </h1>
                  <p className="text-xl lg:text-2xl text-gray-600 mb-8">
                    {content.hero_subtitle}
                  </p>
                  <p className="text-lg text-gray-700 mb-8">
                    {content.hero_description}
                  </p>
                </>
              )}
              <div className="flex flex-col sm:flex-row gap-4">
                <button className="bg-gray-900 text-white px-8 py-3 rounded-md hover:bg-gray-800 transition-colors">
                  Book Consultation
                </button>
                <button className="border border-gray-900 text-gray-900 px-8 py-3 rounded-md hover:bg-gray-900 hover:text-white transition-colors">
                  View Portfolio
                </button>
              </div>
            </div>
            <div className="relative">
              <img
                src="https://images.unsplash.com/photo-1560066984-138dadb4c035?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80"
                alt="Bridal hair styling"
                className="w-full h-96 lg:h-full object-cover rounded-lg shadow-2xl"
                onError={(e) => {
                  e.currentTarget.src = 'https://placehold.co/600x400/png'
                }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="relative">
              <img
                src="https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80"
                alt="Hair stylist at work"
                className="w-full h-96 lg:h-full object-cover rounded-lg shadow-xl"
                onError={(e) => {
                  e.currentTarget.src = 'https://placehold.co/600x400/png'
                }}
              />
            </div>
            <div>
              {editMode ? (
                <div className="space-y-4">
                  <input
                    type="text"
                    value={editingContent?.about_title || ''}
                    onChange={(e) => setEditingContent(prev => prev ? {...prev, about_title: e.target.value} : null)}
                    className="w-full text-3xl lg:text-4xl font-serif text-gray-900 bg-white border border-gray-300 rounded-md px-3 py-2"
                  />
                  <textarea
                    value={editingContent?.about_description || ''}
                    onChange={(e) => setEditingContent(prev => prev ? {...prev, about_description: e.target.value} : null)}
                    className="w-full text-lg text-gray-700 bg-white border border-gray-300 rounded-md px-3 py-2 h-32"
                  />
                </div>
              ) : (
                <>
                  <h2 className="text-3xl lg:text-4xl font-serif text-gray-900 mb-6">
                    {content.about_title}
                  </h2>
                  <p className="text-lg text-gray-700 mb-8">
                    {content.about_description}
                  </p>
                </>
              )}
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-gray-900 rounded-full"></div>
                  <span className="text-gray-700">10+ years of experience</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-gray-900 rounded-full"></div>
                  <span className="text-gray-700">Specialized in bridal styling</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-gray-900 rounded-full"></div>
                  <span className="text-gray-700">Luxury client experience</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-serif text-gray-900 mb-4">
              Services
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Comprehensive hair styling services for your most important moments
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {(editMode ? editingContent?.services : content.services)?.map((service, index) => (
              <div key={index} className="bg-white p-8 rounded-lg shadow-lg">
                {editMode ? (
                  <div className="space-y-4">
                    <input
                      type="text"
                      value={service.name}
                      onChange={(e) => {
                        const newServices = [...(editingContent?.services || [])]
                        newServices[index] = { ...service, name: e.target.value }
                        setEditingContent(prev => prev ? {...prev, services: newServices} : null)
                      }}
                      className="w-full text-xl font-semibold text-gray-900 bg-white border border-gray-300 rounded-md px-3 py-2"
                    />
                    <textarea
                      value={service.description}
                      onChange={(e) => {
                        const newServices = [...(editingContent?.services || [])]
                        newServices[index] = { ...service, description: e.target.value }
                        setEditingContent(prev => prev ? {...prev, services: newServices} : null)
                      }}
                      className="w-full text-gray-600 bg-white border border-gray-300 rounded-md px-3 py-2 h-20"
                    />
                  </div>
                ) : (
                  <>
                    <h3 className="text-xl font-semibold text-gray-900 mb-4">
                      {service.name}
                    </h3>
                    <p className="text-gray-600">
                      {service.description}
                    </p>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Portfolio Section */}
      <section id="portfolio" className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-serif text-gray-900 mb-4">
              Our Work
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Browse through our portfolio of beautiful bridal hairstyles and transformations
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              "https://images.unsplash.com/photo-1595475884771-c6b2c8e5c5c1?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
              "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
              "https://images.unsplash.com/photo-1560066984-138dadb4c035?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
              "https://images.unsplash.com/photo-1581403341630-a6e0b9d2d257?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
              "https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
              "https://images.unsplash.com/photo-1434056886845-dac89ffe9b56?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80"
            ].map((image, index) => (
              <div key={index} className="group relative overflow-hidden rounded-lg shadow-lg">
                <img
                  src={image}
                  alt={`Portfolio image ${index + 1}`}
                  className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300"
                  onError={(e) => {
                    e.currentTarget.src = 'https://placehold.co/500x400/png'
                  }}
                />
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-opacity duration-300"></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl lg:text-4xl font-serif text-gray-900 mb-8">
            Ready to Book Your Appointment?
          </h2>
          <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
            Contact us today to schedule your consultation and create the perfect look for your special day.
          </p>
          <button className="bg-gray-900 text-white px-8 py-3 rounded-md hover:bg-gray-800 transition-colors text-lg">
            Get In Touch
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h3 className="text-2xl font-serif mb-4">Hair by Ms. Stephanie</h3>
          <p className="text-gray-400 mb-4">Luxury bridal hair styling services</p>
          <p className="text-gray-400 text-sm">
            © 2024 Hair by Ms. Stephanie. All rights reserved.
          </p>
        </div>
      </footer>

      {/* Login Modal */}
      {showLogin && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-900">Admin Login</h3>
              <button
                onClick={() => setShowLogin(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={24} />
              </button>
            </div>
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Username
                </label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <button
                type="submit"
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
              >
                <Lock size={16} />
                <span>Login</span>
              </button>
            </form>
            <div className="mt-4 text-sm text-gray-600">
              <p>Demo credentials:</p>
              <p>Username: admin, Password: admin123</p>
              <p>Username: stephanie, Password: stephanie123</p>
            </div>
          </div>
        </div>
      )}
      
      {/* Back to Top Button */}
      {showBackToTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-6 right-6 bg-gray-900 text-white p-3 rounded-full shadow-lg hover:bg-gray-800 transition-all duration-300 z-50"
          aria-label="Back to top"
        >
          <ArrowUp size={20} />
        </button>
      )}
    </div>
  )
}

export default App
