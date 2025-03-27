import DiscordUserLookup from "@/components/DiscordUserLookup";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-[#36393F] py-4 px-6 border-b border-gray-700">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <svg className="w-8 h-8" fill="#5865F2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path d="M20.317 4.4921C18.7873 3.80147 17.147 3.29265 15.4319 3.00122C15.4007 2.99591 15.3695 3.01059 15.3534 3.03993C15.1424 3.40136 14.9087 3.87732 14.7451 4.25606C12.9004 3.98499 11.0652 3.98499 9.25832 4.25606C9.09465 3.86799 8.85248 3.40136 8.64057 3.03993C8.62449 3.01152 8.59328 2.99684 8.56205 3.00122C6.84791 3.29172 5.20756 3.80054 3.67693 4.4921C3.66368 4.4974 3.65233 4.50735 3.64479 4.51916C0.533392 9.09581 -0.31895 13.5569 0.0991801 17.9606C0.101072 17.9827 0.11337 18.0037 0.130398 18.0168C2.18321 19.5275 4.17171 20.4332 6.12328 21.0468C6.15451 21.0562 6.18761 21.0441 6.20748 21.0179C6.66913 20.3823 7.08064 19.7069 7.43348 18.9995C7.4543 18.9576 7.43442 18.9075 7.39186 18.8899C6.73913 18.6584 6.1176 18.3778 5.51973 18.0603C5.47244 18.0323 5.46865 17.9643 5.51216 17.9313C5.63797 17.8341 5.76382 17.7327 5.88396 17.6302C5.90569 17.6114 5.93598 17.607 5.96153 17.6186C9.88928 19.4452 14.1415 19.4452 18.023 17.6186C18.0485 17.6059 18.0788 17.6105 18.1015 17.6291C18.2216 17.7316 18.3475 17.8341 18.4742 17.9313C18.5177 17.9643 18.5149 18.0323 18.4676 18.0603C17.8697 18.3828 17.2482 18.6584 16.5945 18.888C16.552 18.9057 16.533 18.9576 16.5538 18.9995C16.9143 19.7069 17.3258 20.3823 17.7789 21.0168C17.7978 21.0441 17.8319 21.0562 17.8631 21.0468C19.8241 20.4332 21.8126 19.5275 23.8654 18.0168C23.8834 18.0037 23.8948 17.9838 23.8967 17.9617C24.3971 12.8676 23.0585 8.4463 20.3482 4.52009C20.3416 4.50735 20.3303 4.4974 20.317 4.4921ZM8.02002 15.2778C6.8375 15.2778 5.86313 14.1928 5.86313 12.876C5.86313 11.5592 6.8186 10.4742 8.02002 10.4742C9.23087 10.4742 10.1958 11.5683 10.1769 12.876C10.1769 14.1928 9.22141 15.2778 8.02002 15.2778ZM15.9947 15.2778C14.8123 15.2778 13.8379 14.1928 13.8379 12.876C13.8379 11.5592 14.7933 10.4742 15.9947 10.4742C17.2056 10.4742 18.1705 11.5683 18.1516 12.876C18.1516 14.1928 17.2056 15.2778 15.9947 15.2778Z"/>
            </svg>
            Discord User Lookup
          </h1>
          <div className="flex items-center gap-2">
            <span className="hidden sm:inline text-[#B9BBBE]">Find Discord user info by ID</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow py-8 px-6 bg-[#2F3136]">
        <div className="max-w-2xl mx-auto">
          <DiscordUserLookup />
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-[#36393F] py-4 px-6 border-t border-gray-700 mt-auto">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row justify-between items-center">
          <p className="text-[#B9BBBE] text-sm">
            Discord User Lookup - Find any user's information
          </p>
          <p className="text-[#B9BBBE] text-sm mt-2 sm:mt-0">
            This is not affiliated with Discord Inc.
          </p>
        </div>
      </footer>
    </div>
  );
}
