# 2018 AMC 12B Problem 23

## Problem
Ajay is standing at point A near Pontianak, Indonesia, $0^\circ$ latitude and $110^\circ \text{ E}$ longitude. Billy is standing at point B near Big Baldy Mountain, Idaho, USA, $45^\circ \text{ N}$ latitude and $115^\circ \text{ W}$ longitude. Assume that Earth is a perfect sphere with center C. What is the degree measure of $\angle ACB$?

$\textbf{(A) }105 \qquad \textbf{(B) }112\frac{1}{2} \qquad \textbf{(C) }120 \qquad \textbf{(D) }135 \qquad \textbf{(E) }150 \qquad$
## Diagram
> [Asymptote diagram - not rendered in Markdown]

```asy
/* Made by MRENTHUSIASM */ size(250); import graph3; import solids; currentprojection=orthographic((0.2,-0.5,0.2)); triple A, B, C; A = (1,0,0); B = (-1/2,1/2,sqrt(2)/2); C = (0,0,0); draw(unitsphere,white,light=White); dot(A^^B^^C,linewidth(4.5)); draw(Circle(C,1,(0,0,1))^^A--C--B); label("$A$",A,3*dir(A)); label("$B$",B,3*dir(B)); label("$C$",C,3*(0,0,-1));
```

*~MRENTHUSIASM*
## Solution 1 (Tetrahedron)
This solution refers to the **Diagram** section.

Let D be the orthogonal projection of B onto the equator. Note that $\angle BDA = \angle BDC = 90^\circ$ and $\angle BCD = 45^\circ.$ Recall that $115^\circ \text{ W}$ longitude is the same as $245^\circ \text{ E}$ longitude, so $\angle ACD=135^\circ.$

We obtain the following diagram:

> [Asymptote diagram - not rendered in Markdown]

```asy
/* Made by MRENTHUSIASM */ size(250); import graph3; import solids; currentprojection=orthographic((0.2,-0.5,0.2)); triple A, B, C, D; A = (1,0,0); B = (-1/2,1/2,sqrt(2)/2); C = (0,0,0); D = (-1/2,1/2,0); draw(unitsphere,white,light=White); draw(surface(A--B--C--cycle),yellow); dot(A^^B^^C^^D,linewidth(4.5)); draw(Circle(C,1,(0,0,1))^^A--B--D--C--B^^C--A--D); label("$A$",A,3*dir(A)); label("$B$",B,3*dir(B)); label("$C$",C,3*(0,0,-1)); label("$D$",D,3*(-1/2,-1/2,0));
```

Without loss of generality, let AC=BC=1. For tetrahedron ABCD:

 1.   Since $\triangle BCD$ is an isosceles right triangle, we have BD=CD=$\frac{\sqrt2}{2}.$

2.   In $\triangle ACD,$ we apply the Law of Cosines to get AD=$\sqrt{AC^2+CD^2-2\cdot AC\cdot CD\cdot\cos\angle ACD}=\frac{\sqrt{10}}{2}.$

3.   In right $\triangle ABD,$ we apply the Pythagorean Theorem to get AB=$\sqrt{AD^2+BD^2}=\sqrt{3}.$

4.   In $\triangle ABC,$ we apply the Law of Cosines to get $\cos\angle ACB=\frac{AC^2+BC^2-AB^2}{2\cdot AC\cdot BC}=-\frac12,$ so $\angle ACB=\boxed{\textbf{(C) }120}$ degrees.

*~MRENTHUSIASM*
## Solution 2 (Cartesian Coordinates and Vectors)
This solution refers to the **Diagram** section.

Let D be the orthogonal projection of B onto the equator. Note that $\angle BDA = \angle BDC = 90^\circ$ and $\angle BCD = 45^\circ.$ Recall that $115^\circ \text{ W}$ longitude is the same as $245^\circ \text{ E}$ longitude, so $\angle ACD=135^\circ.$

Without loss of generality, let AC=BC=1. As shown below, we place Earth in the xyz-plane with C=(0,0,0) such that the positive x-axis runs through A, the positive y-axis runs through $0^\circ$ latitude and $160^\circ \text{ W}$ longitude, and the positive z-axis runs through the North Pole.

> [Asymptote diagram - not rendered in Markdown]

```asy
/* Made by MRENTHUSIASM */ size(300); import graph3; import solids; currentprojection=orthographic((0.2,-0.5,0.2)); triple A, B, C, D; A = (1,0,0); B = (-1/2,1/2,sqrt(2)/2); C = (0,0,0); D = (-1/2,1/2,0); draw(unitsphere,white,light=White); dot(A^^B^^C^^D,linewidth(4.5)); draw(Circle(C,1,(0,0,1))^^B--C--D--cycle); label("$A$",A,5*dir((2.5,-3,0))); label("$B$",B,3*dir(B)); label("$C$",C,1.5*(1,0,-1)); label("$D$",D,3*(-1/2,-1/2,0)); draw((-1.5,0,0)--(1.5,0,0),linewidth(1.25),EndArrow3(10)); draw((0,-1.5,0)--(0,1.5,0),linewidth(1.25),EndArrow3(10)); draw((0,0,-1.5)--(0,0,1.5),linewidth(1.25),EndArrow3(10)); label("$x$",(1.5,0,0),2*dir((1.5,0,0))); label("$y$",(0,1.5,0),3*dir((0,1.5,0))); label("$z$",(0,0,1.5),2*dir((0,0,1.5)));
```

It follows that A=(1,0,0) and D=(-t,t,0) for some positive number t. Since $\triangle BCD$ is an isosceles right triangle, we have B=$\left(-t,t,\sqrt{2}t\right).$ By the Distance Formula, we get $(-t)^2+t^2+\left(\sqrt{2}t\right)^2=1,$ from which $t=\frac12.$


$$
As \vec{A} = \begin{pmatrix}1 \\ 0 \\ 0 \end{pmatrix} and \vec{B} = \begin{pmatrix}-1/2 \\ 1/2 \\ \sqrt2/2 \end{pmatrix}, we obtain \cos\angle ACB=\frac{\vec{A}\bullet\vec{B}}{\left\lVert\vec{A}\right\rVert\left\lVert\vec{B}\right\rVert}=-\frac12 by the dot product, so \angle ACB=\boxed{\textbf{(C) }120} degrees.
$$


*~MRENTHUSIASM*
## Solution 3 (Spherical Coordinates and Vectors)
This solution refers to the diagram in Solution 2.

In spherical coordinates ($\rho,\theta,\phi),$ note that $\rho,\theta,$ and $\phi$ represent the radial distance, the polar angle, and the azimuthal angle, respectively.

Without loss of generality, let AC=BC=1. As shown in Solution 2, we place Earth in the xyz-plane with origin C such that the positive x-axis runs through A, the positive y-axis runs through $0^\circ$ latitude and $160^\circ \text{ W}$ longitude, and the positive z-axis runs through the North Pole.

In spherical coordinates, we have A=(1,$90^\circ,0^\circ)$ and B=(1,$45^\circ,135^\circ).$ Now, we express $\vec{A}$ and $\vec{B}$ in Cartesian coordinates: $\vec{A} = \begin{pmatrix}\sin90^\circ \cos0^\circ$ \\ $\sin90^\circ \sin0^\circ$ \\ $\cos90^\circ \end{pmatrix} = \begin{pmatrix}$1 \\ 0 \\ 0 $\end{pmatrix} \text{ and } \vec{B} = \begin{pmatrix}\sin45^\circ \cos135^\circ$ \\ $\sin45^\circ \sin135^\circ$ \\ $\cos45^\circ \end{pmatrix} = \begin{pmatrix}-$1/2 \\ 1/2 \\ $\sqrt2/$2 $\end{pmatrix}.$
We continue with the last paragraph of Solution 2 to get the answer $\angle ACB=\boxed{\textbf{(C) }120}$ degrees.

*~MRENTHUSIASM*
## Solution 4 (It's not that deep)
This solution refers to the diagram in Solution 2. Let the radius of the sphere be r.

Form $\triangle{ABC}$ and notice that it is isosceles, with AC=BC. Draw the circle with radius equal to the sphere (great circle) with $0^{\circ}$ latitude.

Drop a perpendicular from B onto this circle. Let the foot of this perpendicular be called D. Since $\angle{DCA} = 135^{\circ},$ by Law of Cosines on $\triangle{ACD}, (AD)^2 = \frac{5}{2}$r^2. Since BD is a perpendicular, we can form right triangle $\triangle{BDA}.$ By Pythag, AB=$\sqrt{\frac{1}{2}r^2 + \frac{5}{2}r^2} =r\sqrt{3}.$ Since $\triangle{ABC}$ has side lengths r, r,  and $r\sqrt{3}, \angle{BCA} = \boxed{\textbf{(C) }120^{\circ}}.$

*~skibbysiggy*
## See Also
