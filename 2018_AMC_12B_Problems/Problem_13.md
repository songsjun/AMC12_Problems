# 2018 AMC 12B Problem 13

## Problem
Square ABCD has side length 30. Point P lies inside the square so that AP = 12 and BP = 26. The centroids of $\triangle{ABP}, \triangle{BCP}, \triangle{CDP},$ and $\triangle{DAP}$ are the vertices of a convex quadrilateral. What is the area of that quadrilateral?


> [Asymptote diagram - not rendered in Markdown]

```asy
unitsize(120); pair B = (0, 0), A = (0, 1), D = (1, 1), C = (1, 0), P = (1/4, 2/3); draw(A--B--C--D--cycle); dot(P); defaultpen(fontsize(10pt)); draw(A--P--B); draw(C--P--D); label("$A$", A, W); label("$B$", B, W); label("$C$", C, E); label("$D$", D, E); label("$P$", P, N*1.5+E*0.5); dot(A); dot(B); dot(C); dot(D);
```


$\textbf{(A) }100\sqrt{2}\qquad\textbf{(B) }100\sqrt{3}\qquad\textbf{(C) }200\qquad\textbf{(D) }200\sqrt{2}\qquad\textbf{(E) }200\sqrt{3}$
## Solution 1 (Similar Triangles)
As shown below, let $M_1,M_2,M_3,M_4$ be the midpoints of $\overline{AB},\overline{BC},\overline{CD},\overline{DA},$ respectively, and $G_1,G_2,G_3,G_4$ be the centroids of $\triangle{ABP},\triangle{BCP},\triangle{CDP},\triangle{DAP},$ respectively.

> [Asymptote diagram - not rendered in Markdown]

```asy
/* Made by MRENTHUSIASM */ unitsize(210); pair B = (0, 0), A = (0, 1), D = (1, 1), C = (1, 0), P = (1/4, 2/3); pair M1 = midpoint(A--B); pair M2 = midpoint(B--C); pair M3 = midpoint(C--D); pair M4 = midpoint(D--A); pair G1 = centroid(A,B,P); pair G2 = centroid(B,C,P); pair G3 = centroid(C,D,P); pair G4 = centroid(D,A,P); filldraw(M1--M2--P--cycle,red); filldraw(M2--M3--P--cycle,yellow); filldraw(M3--M4--P--cycle,green); filldraw(M4--M1--P--cycle,lightblue); draw(A--B--C--D--cycle); draw(M1--M2--M3--M4--cycle); draw(G1--G2--G3--G4--cycle); dot(P); defaultpen(fontsize(10pt)); draw(A--P--B); draw(C--P--D); label("$A$", A, W); label("$B$", B, W); label("$C$", C, E); label("$D$", D, E); label("$P$", P, N); label("$M_1$", M1, W); label("$M_2$", M2, S); label("$M_3$", M3, E); label("$M_4$", M4, N); label("$G_1$", G1, 1.5S); label("$G_2$", G2, 1.5E); label("$G_3$", G3, 1.5NE); label("$G_4$", G4, 1.5E); dot(A); dot(B); dot(C); dot(D); dot(M1); dot(M2); dot(M3); dot(M4); dot(G1); dot(G2); dot(G3); dot(G4);
```

By SAS, we conclude that $\triangle G_1G_2P\sim\triangle M_1M_2P, \triangle G_2G_3P\sim\triangle M_2M_3P, \triangle G_3G_4P\sim\triangle M_3M_4P,$ and $\triangle G_4G_1P\sim\triangle M_4M_1P.$ By the properties of centroids, the ratio of similitude for each pair of triangles is $\frac{2}{3}.$

Note that quadrilateral $M_1M_2M_3M_4$ is a square of side-length $15\sqrt2.$ It follows that:

 1.   Since $\overline{G_1G_2}$\parallel$\overline{M_1M_2},\overline{G_2G_3}$\parallel$\overline{M_2M_3},\overline{G_3G_4}$\parallel$\overline{M_3M_4},$ and $\overline{G_4G_1}$\parallel$\overline{M_4M_1}$ by the Converse of the Corresponding Angles Postulate, we have $\angle G_1G_2G_3=\angle G_2G_3G_4=\angle G_3G_4G_1=\angle G_4G_1G_2=90^\circ.$

2.   Since $G_1G_2=\frac23M_1M_2, G_2G_3=\frac23M_2M_3, G_3G_4=\frac23M_3M_4,$ and $G_4G_1=\frac23M_4M_1$ by the ratio of similitude, we have $G_1G_2=G_2G_3=G_3G_4=G_4G_1=10\sqrt2.$

Together, quadrilateral $G_1G_2G_3G_4$ is a square of side-length $10\sqrt2,$ so its area is $\left(10\sqrt2\right)^2=\boxed{\textbf{(C) }200}.$

**Remark**

This solution shows that, if point P is within square ABCD, then the shape and the area of quadrilateral $G_1G_2G_3G_4$ are independent of the location of P. Let the brackets denote areas. More generally, $G_1G_2G_3G_4$ is always a square of area [$G_1G_2G_3G_$4]=$\left(\frac23\right)^$2[$M_1M_2M_3M_$4]=$\frac4$9[$M_1M_2M_3M_$4]=$\frac29$[ABCD]. On the other hand, the location of $G_1G_2G_3G_4$ is dependent on the location of P.

*~RandomPieKevin ~Kyriegon ~MRENTHUSIASM*
## Solution 2 (Similar Triangles)
This solution refers to the diagram in Solution 1.

By SAS, we conclude that $\triangle G_1G_3P\sim\triangle M_1M_3P$ and $\triangle G_2G_4P\sim\triangle M_2M_4P.$ By the properties of centroids, the ratio of similitude for each pair of triangles is $\frac23.$

Note that quadrilateral $M_1M_2M_3M_4$ is a square of diagonal-length 30, so $\overline{M_1M_3}$\perp$\overline{M_2M_4}.$ Since $\overline{G_1G_3}$\parallel$\overline{M_1M_3}$ and $\overline{G_2G_4}$\parallel$\overline{M_2M_4}$ by the Converse of the Corresponding Angles Postulate, we have $\overline{G_1G_3}$\perp$\overline{G_2G_4}.$

Therefore, the area of quadrilateral $G_1G_2G_3G_4$ is $\frac12\cdot G_1G_3\cdot G_2G_4 = \frac12\cdot\left(\frac23\cdot M_1M_3\right)\cdot\left(\frac23\cdot M_2M_4\right)=\boxed{\textbf{(C) }200}.$
*~Funnybunny5246 ~MRENTHUSIASM*
## Solution 3 (Coordinate Geometry)
This solution refers to the diagram in Solution 1.

We place the diagram in the coordinate plane: Let A=(0,30),B=(0,0),C=(30,0),D=(30,30), and P=($3x$,$3y$).

Recall that for any triangle in the coordinate plane, the coordinates of its centroid are the averages of the coordinates of its vertices. It follows that $G_1=(x,y+10),G_2=(x+10,y),G_3=(x+20,y+10$), and $G_4=(x+10,y+20$).

Note that $G_1G_3=G_2G_4=20$ and $\overline{G_1G_3}$\perp$\overline{G_2G_4}.$ Therefore, the area of quadrilateral $G_1G_2G_3G_4$ is $\frac12\cdot G_1G_3\cdot G_2G_4=\boxed{\textbf{(C) }200}.$

*~Pi31415926535897 ~MRENTHUSIASM*
## Solution 4 (Homothety)
Let X,Y,Z,W be the midpoints of sides AB,BC,CD,DE, respectively.

Notice that a homothety centered at P with ratio $\frac{2}{3}$ will send XYZW to $G_{1}G_{2}G_{3}G_{4}$, so $G_{1}G_{2}G_{3}G_{4}$ is a square with area $\left(\frac{2}{3}\right)^2$ [XYZW], but [XYZW]=$\frac{1}{2}$[ABCD] so our desired area is $\frac{4}{9}\cdot\frac{1}{2}\cdot900=\boxed{\textbf{(C) }200}$

*~chrisdiamond10*

Desmos graph:
https://www.desmos.com/calculator/cqozcf5ef1
*~Ynsg*
## Video Solution (Meta-Solving Technique)
https://youtu.be/GmUWIXXf_uk?t=1439

*~pi_is_3.14*
## See Also
