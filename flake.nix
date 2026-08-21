{
  description = "Ambiente de desenvolvimento e build do Atelie Ma-Croche";

  inputs.nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";

  outputs = { self, nixpkgs }:
    let
      supportedSystems = [
        "x86_64-linux"
        "aarch64-linux"
        "x86_64-darwin"
        "aarch64-darwin"
      ];
      forAllSystems = nixpkgs.lib.genAttrs supportedSystems;
    in
    {
      packages = forAllSystems (system:
        let
          pkgs = nixpkgs.legacyPackages.${system};
        in
        {
          default = pkgs.buildNpmPackage {
            pname = "atelie-ma-croche";
            version = "0.0.1";
            src = self;

            nodejs = pkgs.nodejs_22;
            npmDepsHash = "sha256-GFpXav6Zd7qcaux9hkQca1cNYVH9o1MqmexlUpRlY8Q=";

            npmBuildScript = "build";
            installPhase = ''
              runHook preInstall
              cp -r dist $out
              runHook postInstall
            '';
          };
        });

      devShells = forAllSystems (system:
        let
          pkgs = nixpkgs.legacyPackages.${system};
        in
        {
          default = pkgs.mkShell {
            inputsFrom = [ ];
            packages = [
              pkgs.nodejs_22
              pkgs.importNpmLock.hooks.linkNodeModulesHook
            ];

            npmDeps = pkgs.importNpmLock.buildNodeModules {
              npmRoot = ./.;
              nodejs = pkgs.nodejs_22;
            };

            shellHook = ''
              linkNodeModulesHook
              export PATH="$PWD/node_modules/.bin:$PATH"
              echo "Atelie Ma-Croche — Node $(node --version), npm $(npm --version)"
              echo "node_modules gerado declarativamente a partir do package-lock.json."
              echo "Use 'npm run dev' normalmente."
            '';
          };
        });
    };
}
