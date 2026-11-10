# Licensight Policy Violations - Remediation Guide

**Generated**: 2025-12-15  
**Application**: DEV-tools  
**Project**: DEV-tools

## Executive Summary

Licensight scan identified **21 policy violations** across the DEV-tools project:
- **9 vulnerable components** (1 CRITICAL, 4 HIGH, 14 MODERATE, 3 LOW)
- **10 components with missing licenses**
- **1 component with license not in policy** (BlueOak)
- **1 policy violation** (GNU GPL v2.0 in kafka service)
- **1 approval needed** (Mozilla Public License 2.0 in kafka service)

**View Full Report**: [Licensight Dashboard](https://licensight-dev.homologation.cloud/applications/668d53f4a1aea64f2892e49e/policy-violations)

---

## 🚨 Critical Vulnerabilities (Fix Immediately)

### 1. form-data v4.0.1 → v4.0.4+
- **CVE**: GHSA-fjxv-7rqg-78g4
- **Severity**: CRITICAL (9.4/10)
- **Issue**: Uses unsafe random function for boundary selection
- **Impact**: Security vulnerability in form submissions
- **Fix**: 
  ```bash
  pnpm update form-data@4.0.4
  ```
- **Verification**: Check `pnpm list form-data` shows v4.0.4+

---

## 🔴 High Severity Vulnerabilities (Fix Within 7 Days)

### 2. axios v1.7.9 → v1.12.0+
- **CVEs**: 
  - GHSA-4hjh-wcwx-xvwj (7.5/10) - DoS through lack of data size check
  - GHSA-jr5f-v2jv-69x6 (7.7/10) - SSRF and credential leakage
- **Impact**: Security vulnerabilities in HTTP requests
- **Fix**:
  ```bash
  pnpm update axios@1.12.0
  ```
- **Note**: This is a direct dependency - update package.json if needed

### 3. rollup v4.18.0 → v4.22.4+
- **CVE**: GHSA-gcx4-mw62-g8wm
- **Severity**: HIGH (8.3/10)
- **Issue**: DOM Clobbering gadget leads to XSS
- **Fix**: Update via parent dependency (vite)
  ```bash
  pnpm update
  ```

### 4. cross-spawn v7.0.3 → v7.0.5+
- **CVE**: GHSA-3xgq-45jj-v275
- **Severity**: HIGH (7.7/10)
- **Issue**: Regular Expression Denial of Service (ReDoS)
- **Fix**: Update transitive dependencies
  ```bash
  pnpm update
  ```

---

## 🟡 Moderate Severity Vulnerabilities (Fix Within 30 Days)

### 5. vite v5.2.8 → v5.4.21+
**11 vulnerabilities found** (scores 4.8-6.9):
- GHSA-9cwx-2883-4wfx (6.9) - `server.fs.deny` bypass with `?import&raw`
- GHSA-vg6x-rcgg-rjx6 (6.5) - Unauthorized requests to dev server
- GHSA-93m4-6634-74q7 (6.0) - `server.fs.deny` bypass with backslash on Windows
- GHSA-859w-5945-r5v3 (6.0) - `server.fs.deny` bypass with `/.`
- GHSA-356w-63v5-8wf4 (6.0) - `server.fs.deny` bypass with invalid request-target
- GHSA-xcj6-pq6g-qj4x (5.3) - `server.fs.deny` bypass with .svg or relative paths
- GHSA-4r4m-qw57-chr8 (5.3) - `server.fs.deny` bypass for inline and raw
- GHSA-x574-m823-4x7w (5.3) - Bypass with `?raw??`
- GHSA-64vr-g452-qvp3 (4.8) - DOM Clobbering leading to XSS

**Fix**:
```bash
pnpm update vite@5.4.21
```

**Testing Required**:
- Development server functionality
- Build process
- HMR (Hot Module Replacement)
- File serving security

### 6. js-yaml v4.1.0 → v4.1.1+
- **CVE**: GHSA-mh29-5h37-fv8m
- **Severity**: MODERATE (5.3/10)
- **Issue**: Prototype pollution in merge operator
- **Fix**: Update transitive dependencies

### 7. esbuild v0.20.2 → v0.25.0+
- **CVE**: GHSA-67mh-4wv8-2f99
- **Severity**: MODERATE (5.3/10)
- **Issue**: Enables unauthorized requests to development server
- **Fix**: Update via parent dependency (vite)

### 8. micromatch v4.0.7 → v4.0.8+
- **CVE**: GHSA-952p-6rrq-rcjv
- **Severity**: MODERATE (5.3/10)
- **Issue**: Regular Expression Denial of Service (ReDoS)
- **Fix**: Update transitive dependencies

### 9. nanoid v3.3.7 → v3.3.8+
- **CVE**: GHSA-mwcw-c2x4-8c55
- **Severity**: MODERATE (4.3/10)
- **Issue**: Predictable results when given non-integer values
- **Fix**: Update transitive dependencies

### 10. vue-template-compiler v2.7.16 → v3.0.0+
- **CVE**: GHSA-g3ch-rx76-35fx
- **Severity**: MODERATE (4.2/10)
- **Issue**: Client-side Cross-Site Scripting (XSS)
- **Fix**: Update transitive dependencies
- **Note**: Major version change - test thoroughly

---

## 🟢 Low Severity Vulnerabilities (Fix When Convenient)

### 11. brace-expansion v2.0.1 → v2.0.2+
- **CVE**: GHSA-v6h2-p8h4-qcjw
- **Severity**: LOW (1.3/10)
- **Issue**: ReDoS vulnerability
- **Fix**: Update transitive dependencies

### 12. vite v5.2.8 (Additional Low Severity)
- GHSA-jqfw-vq24-v9c3 (2.3) - `server.fs` settings not applied to HTML
- GHSA-g4jq-h2w9-997c (2.3) - Middleware may serve files with same name prefix

---

## 📝 License Policy Violations

### Missing Licenses (10 components)

These components are missing license information in Licensight:

1. **minimatch** (3 versions: v9.0.5, v9.0.4, v3.1.2)
   - Transitive dependency via various packages
   - **Action**: Update parent packages; license is actually ISC
   
2. **rimraf v3.0.2**
   - Transitive dependency
   - **Action**: Update parent packages; license is actually ISC

3. **inherits v2.0.4**
   - Transitive dependency
   - **Action**: Update parent packages; license is actually ISC

4. **once v1.4.0**
   - Transitive dependency
   - **Action**: Update parent packages; license is actually ISC

5. **isexe v2.0.0**
   - Transitive dependency
   - **Action**: Update parent packages; license is actually ISC

6. **vue-diff v1.2.4**
   - Direct dependency in package.json
   - **Action**: Verify license with maintainer; likely MIT

7. **vue3-json-viewer v2.2.2**
   - Direct dependency in package.json
   - **Action**: Verify license with maintainer; likely MIT

8. **mongo v5.0** (service)
   - Service dependency
   - **Action**: Document MongoDB license (SSPL)

**Recommendation**: Most of these are actually licensed (ISC/MIT) but not properly detected by Licensight. Update to latest versions to get better license metadata.

### License Not in Policy

**fs.realpath v1.0.0** - BlueOak license
- **Action**: Add BlueOak License to Licensight policy whitelist
- **Details**: BlueOak is an open-source friendly license
- **Steps**: Contact Licensight admin to add license to approved list

### Policy Violations - Copyleft Licenses

**kafka v2.0 (service)**
- **Violations**:
  - GNU General Public License v2.0 or later (Policy violation)
  - Mozilla Public License 2.0 (Approval needed)
- **Impact**: Copyleft license may affect distribution rights
- **Recommendation**: 
  1. Review with legal team
  2. Confirm Kafka is only used in development/testing
  3. If used in production, consider alternatives or get legal approval
  4. Document decision in LICENSE or NOTICE file

---

## 🔧 Step-by-Step Remediation

### Phase 1: Critical & High Priority Fixes (Week 1)

```bash
# 1. Backup current state
git checkout -b fix/licensight-vulnerabilities

# 2. Update critical packages
pnpm update axios@1.12.0
pnpm update form-data@4.0.4

# 3. Update vite (addresses multiple issues)
pnpm update vite@5.4.21

# 4. Update all other dependencies
pnpm update

# 5. Verify updates
pnpm list axios
pnpm list form-data
pnpm list vite

# 6. Run tests
pnpm type-check
pnpm lint
pnpm build
```

### Phase 2: Testing & Validation (Week 1)

1. **Run existing tests**:
   ```bash
   # If tests exist
   pnpm test
   ```

2. **Manual testing**:
   - Start dev server: `pnpm dev`
   - Test key features
   - Verify no console errors
   - Test production build: `pnpm build && pnpm preview`

3. **Verify security fixes**:
   - Re-run Licensight scan
   - Check that vulnerable versions are gone
   - Confirm new versions are installed

### Phase 3: License Compliance (Week 2)

1. **Update Licensight policy**:
   - Add BlueOak license to whitelist
   - Document Kafka license decision

2. **Document changes**:
   - Update CHANGELOG.md
   - Add LICENSE file if missing
   - Document third-party licenses

3. **Commit changes**:
   ```bash
   git add .
   git commit -m "fix: Update dependencies to resolve Licensight violations"
   git push origin fix/licensight-vulnerabilities
   ```

### Phase 4: Prevention & Monitoring (Ongoing)

1. **Set up automated dependency updates**:
   - Configure Renovate Bot or Dependabot
   - Enable automatic security updates

2. **Regular security scanning**:
   - Schedule weekly Licensight scans
   - Monitor security advisories
   - Set up GitHub security alerts

3. **License policy enforcement**:
   - Document acceptable licenses
   - Review new dependencies before adding
   - Regular license audits

---

## 📊 Expected Outcomes

After completing all phases:

**Before**:
- ❌ 21 policy violations
- ❌ 1 CRITICAL vulnerability
- ❌ 4 HIGH vulnerabilities
- ❌ 14 MODERATE vulnerabilities
- ❌ 10 license issues

**After**:
- ✅ 0-2 remaining violations (kafka service decision)
- ✅ 0 CRITICAL vulnerabilities
- ✅ 0 HIGH vulnerabilities
- ✅ 0 MODERATE vulnerabilities
- ✅ License policy clarified

---

## ⚠️ Important Notes

1. **Breaking Changes**: Updating to major versions (e.g., vue-template-compiler) may introduce breaking changes. Test thoroughly.

2. **Kafka Service**: Decision needed on kafka v2.0 with GPL license. Options:
   - Accept GPL terms if only used internally
   - Replace with alternative (e.g., RabbitMQ, Redis)
   - Get legal approval

3. **Transitive Dependencies**: Many vulnerabilities are in transitive dependencies. Updating parent packages should resolve these.

4. **Development vs Production**: Some vulnerabilities (vite, esbuild) mainly affect development environment. Still recommended to fix.

5. **Lock File**: After updates, commit the updated `pnpm-lock.yaml` to ensure consistent installations.

---

## 📞 Support & Questions

- **Licensight Issues**: Contact Licensight support or admin
- **Technical Questions**: Review with development team
- **Legal Questions**: Consult with legal team for license compliance

---

## 🔗 References

- [Licensight Dashboard](https://licensight-dev.homologation.cloud/applications/668d53f4a1aea64f2892e49e/policy-violations)
- [GitHub Security Advisories](https://github.com/advisories)
- [npm Security](https://docs.npmjs.com/auditing-package-dependencies-for-security-vulnerabilities)
- [SPDX License List](https://spdx.org/licenses/)
