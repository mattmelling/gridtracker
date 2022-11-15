{
  outputs = { self, nixpkgs }: {
    overlays.default = (final: prev: {
      gridtracker = self.packages.x86_64-linux.gridtracker;
    });
    packages.x86_64-linux.gridtracker = let
      pkgs = import nixpkgs {
        system = "x86_64-linux";
      };
    in pkgs.stdenv.mkDerivation {
      pname = "gridtracker";
      version = "1.22.1204";
      src = ./.;
      installPhase = ''
        make DESTDIR=$out NO_DIST_INSTALL=1 install
        substituteInPlace $out/usr/bin/gridtracker \
            --replace "exec nw" "exec ${pkgs.nwjs}/bin/nw" \
            --replace "/usr/share/gridtracker" "$out/usr/share/gridtracker"
        mkdir -p $out/bin
        ln -s $out/usr/bin/gridtracker $out/bin/gridtracker
      '';
    };
    defaultPackage.x86_64-linux = self.packages.x86_64-linux.gridtracker;
    hydraJobs = {
      inherit (self) packages;
    };
  };
}
