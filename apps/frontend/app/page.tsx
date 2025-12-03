import { Pencil, Layers, Users, Zap, ArrowRight, Github, Sparkles } from 'lucide-react';

function App() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <nav className="border-b border-gray-700 bg-gray-900/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-8 h-8 text-red-500" />
            <span className="text-2xl font-bold text-white">DrawSpace</span>
          </div>
          <div className="flex items-center gap-4">
            <button className="text-gray-300 hover:text-white transition-colors px-4 py-2 hover:bg-gray-800/50 rounded-lg">
              Sign In
            </button>
            <button className="bg-red-600 hover:bg-red-500 text-white px-6 py-2 rounded-lg transition-all hover:shadow-lg hover:shadow-red-500/50">
              Sign Up
            </button>
          </div>
        </div>
      </nav>

      <main>
        <section className="max-w-7xl mx-auto px-6 pt-32 pb-20">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-block mb-6">
              <span className="text-sm font-semibold text-red-400 bg-red-400/10 px-4 py-2 rounded-full border border-red-400/30">
                Your Creative Canvas Awaits
              </span>
            </div>
            <h1 className="text-7xl font-bold text-white mb-8 leading-tight">
              Sketch, Collaborate,
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-red-400"> Create Together</span>
            </h1>
            <p className="text-xl text-gray-400 mb-12 leading-relaxed max-w-2xl mx-auto">
              A powerful whiteboard tool for visualizing ideas, diagrams, and workflows. Simple, intuitive, and built for teams that move fast.
            </p>
            <div className="flex items-center justify-center gap-4 flex-wrap">
              <button className="group bg-red-600 hover:bg-red-500 text-white px-8 py-4 rounded-lg text-lg font-semibold transition-all hover:shadow-2xl hover:shadow-red-500/50 hover:scale-105 flex items-center gap-2">
                Start Drawing
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
              <button className="bg-gray-800 hover:bg-gray-700 text-white px-8 py-4 rounded-lg text-lg font-semibold transition-all border border-gray-700 hover:border-red-600 hover:border-opacity-50 flex items-center gap-2">
                <Github className="w-5 h-5" />
                View on GitHub
              </button>
            </div>
          </div>
        </section>

        <section className="bg-gray-900/50 py-24 border-y border-gray-800">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-white mb-4">Powerful Features</h2>
              <p className="text-gray-400 text-lg">Everything you need to create beautiful diagrams and sketches</p>
            </div>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="group bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-8 hover:bg-gray-800 hover:border-red-600/50 transition-all hover:shadow-xl hover:shadow-red-500/10 hover:-translate-y-1">
                <div className="w-14 h-14 bg-red-600/20 rounded-lg flex items-center justify-center mb-4 group-hover:bg-red-600/30 transition-colors">
                  <Layers className="w-7 h-7 text-red-400" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-3">Infinite Canvas</h3>
                <p className="text-gray-400 leading-relaxed">
                  Draw without limits. Pan, zoom, and create on an endless canvas that grows with your ideas.
                </p>
              </div>

              <div className="group bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-8 hover:bg-gray-800 hover:border-red-600/50 transition-all hover:shadow-xl hover:shadow-red-500/10 hover:-translate-y-1">
                <div className="w-14 h-14 bg-red-600/20 rounded-lg flex items-center justify-center mb-4 group-hover:bg-red-600/30 transition-colors">
                  <Users className="w-7 h-7 text-red-400" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-3">Real-time Collaboration</h3>
                <p className="text-gray-400 leading-relaxed">
                  Work together seamlessly. See changes instantly as your team creates in real-time.
                </p>
              </div>

              <div className="group bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-8 hover:bg-gray-800 hover:border-red-600/50 transition-all hover:shadow-xl hover:shadow-red-500/10 hover:-translate-y-1">
                <div className="w-14 h-14 bg-red-600/20 rounded-lg flex items-center justify-center mb-4 group-hover:bg-red-600/30 transition-colors">
                  <Zap className="w-7 h-7 text-red-400" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-3">Lightning Fast</h3>
                <p className="text-gray-400 leading-relaxed">
                  Optimized performance for smooth drawing experience, even with complex diagrams.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="max-w-7xl mx-auto px-6 py-24">
          <div className="text-center max-w-3xl mx-auto">
            <h2 className="text-4xl font-bold text-white mb-6">Ready to bring your ideas to life?</h2>
            <p className="text-gray-400 mb-10 text-lg">
              Join thousands of creators, designers, and teams using DrawSpace every day.
            </p>
            <button className="group bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 text-white px-10 py-4 rounded-lg text-lg font-semibold transition-all hover:shadow-2xl hover:shadow-red-500/50 hover:scale-105 flex items-center gap-2 mx-auto">
              Create Your First Board
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </section>
      </main>

      <footer className="border-t border-gray-800 bg-gray-900/50">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <h4 className="text-white font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-red-400 transition-colors">Features</a></li>
                <li><a href="#" className="hover:text-red-400 transition-colors">Pricing</a></li>
                <li><a href="#" className="hover:text-red-400 transition-colors">Security</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-red-400 transition-colors">About</a></li>
                <li><a href="#" className="hover:text-red-400 transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-red-400 transition-colors">Careers</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Resources</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-red-400 transition-colors">Docs</a></li>
                <li><a href="#" className="hover:text-red-400 transition-colors">Support</a></li>
                <li><a href="#" className="hover:text-red-400 transition-colors">Community</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-red-400 transition-colors">Privacy</a></li>
                <li><a href="#" className="hover:text-red-400 transition-colors">Terms</a></li>
                <li><a href="#" className="hover:text-red-400 transition-colors">Contact</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8">
            <div className="flex items-center justify-between text-gray-500">
              <p>© 2024 DrawSpace. All rights reserved.</p>
              <div className="flex gap-4">
                <a href="#" className="hover:text-red-400 transition-colors"><Github className="w-5 h-5" /></a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
