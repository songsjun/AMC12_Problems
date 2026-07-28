# syntax=docker/dockerfile:1
#
# The renderer deliberately lives in a container so historical AoPS-derived
# Asymptote is never evaluated on the developer's host.  The base image digest
# is recorded here to make the toolchain reviewable and repeatable.
FROM debian:bookworm@sha256:9344f8b8992482f80cba753f323adeaf17690076c095ccff6cc9536be98185dc

ARG DEBIAN_FRONTEND=noninteractive
ARG DEBIAN_SNAPSHOT=20251020T000000Z

RUN rm -f /etc/apt/sources.list.d/debian.sources \
    && printf '%s\n' \
        "deb [check-valid-until=no] http://snapshot.debian.org/archive/debian/${DEBIAN_SNAPSHOT} bookworm main" \
        "deb [check-valid-until=no] http://snapshot.debian.org/archive/debian/${DEBIAN_SNAPSHOT} bookworm-updates main" \
        "deb [check-valid-until=no] http://snapshot.debian.org/archive/debian-security/${DEBIAN_SNAPSHOT} bookworm-security main" \
        > /etc/apt/sources.list \
    && apt-get update -o Acquire::Check-Valid-Until=false \
    && apt-get install --no-install-recommends -y \
        asymptote=2.85+ds-1 \
        ca-certificates=20230311+deb12u1 \
        dvisvgm=3.0.3-1 \
        ghostscript=10.0.0~dfsg-11+deb12u8 \
        python3-pil=9.4.0-1.1+deb12u1 \
        texlive-latex-base=2022.20230122-3 \
        texlive-latex-recommended=2022.20230122-3 \
    && rm -rf /var/lib/apt/lists/*

COPY render_media.py /usr/local/bin/render_media.py

ENTRYPOINT ["python3", "/usr/local/bin/render_media.py"]
