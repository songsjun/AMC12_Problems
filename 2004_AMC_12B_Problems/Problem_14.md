# 2004 AMC 12B Problem 14

## Problem
In $\triangle ABC, AB=13, AC=5,$ and BC=12. Points M and N lie on AC and BC, respectively, with CM=CN=4. Points J and K are on AB so that MJ and NK are perpendicular to AB. What is the area of pentagon CMJKN?


> [Asymptote diagram - not rendered in Markdown]

```asy
unitsize(0.5cm); defaultpen(0.8); pair C=(0,0), A=(0,5), B=(12,0), M=(0,4), N=(4,0); pair J=intersectionpoint(A--B, M--(M+rotate(90)*(B-A)) ); pair K=intersectionpoint(A--B, N--(N+rotate(90)*(B-A)) ); draw( A--B--C--cycle ); draw( M--J ); draw( N--K ); label("$A$",A,NW); label("$B$",B,SE); label("$C$",C,SW); label("$M$",M,SW); label("$N$",N,S); label("$J$",J,NE); label("$K$",K,NE);
```


$$\mathrm{(A)}\ 15 \qquad \mathrm{(B)}\ \frac{81}{5} \qquad \mathrm{(C)}\ \frac{205}{12} \qquad \mathrm{(D)}\ \frac{240}{13} \qquad \mathrm{(E)}\ 20$$

## Solution
### Solution 1
The triangle ABC is clearly a right triangle, its area is $\frac{5\cdot 12}2 = 30.$ If we knew the areas of triangles AMJ and BNK, we could subtract them to get the area of the pentagon.

Draw the height CL from C onto AB. As AB=13 and the area is 30, we get CL=$\frac{60}{13}.$ The situation is shown in the picture below:


> [Asymptote diagram - not rendered in Markdown]

```asy
unitsize(0.5cm); defaultpen(0.8); pair C=(0,0), A=(0,5), B=(12,0), M=(0,4), N=(4,0); pair J=intersectionpoint(A--B, M--(M+rotate(90)*(B-A)) ); pair K=intersectionpoint(A--B, N--(N+rotate(90)*(B-A)) ); pair L=intersectionpoint(A--B, C--(C+rotate(90)*(B-A)) ); draw( A--B--C--cycle ); draw( M--J ); draw( N--K ); draw( C--L, dashed ); label("$A$",A,NW); label("$B$",B,SE); label("$C$",C,SW); label("$M$",M,SW); label("$N$",N,S); label("$J$",J,NE); label("$K$",K,NE); label("$L$",L,NE);
```


Now note that the triangles ABC, AMJ, ACL, CBL and NBK all have the same angles and therefore they are similar. We already know some of their sides, and we will use this information to compute their areas. Note that if two polygons are similar with ratio k, their areas have ratio $k^2.$ We will use this fact repeatedly.
Below we will use [XYZ] to denote the area of the triangle XYZ.

We have $\frac{CL}{BC} = \frac{60/13}{12} = \frac 5{13},$ hence [ACL] = $\frac{ 25[ABC] }{169} = \frac{750}{169}.$

Also, $\frac{CL}{AC} = \frac{60/13}5 = \frac{12}{13},$ hence [CBL] = $\frac{ 144[ABC] }{169} = \frac{4320}{169}.$

Now for the smaller triangles:

We know that $\frac{AM}{AC}=\frac 15,$ hence [AMJ] = $\frac{[ACL]}{25} = \frac{30}{169}.$

Similarly, $\frac{BN}{BC}=\frac 8{12} = \frac 23,$ hence [NBK] = $\frac{4[CBL]}9 = \frac{1920}{169}.$

Finally, the area of the pentagon is 30 - $\frac{30}{169} - \frac{1920}{169} = \boxed{\frac{240}{13}}.$
#### Solution 1a
Observe that all of the triangles in the problem are right triangles and similar with a ratio of 5-12-13. The largest triangle $\Delta ABC$ has area $\dfrac{5\cdot12}2=30. \Delta AMJ$ is linearly scaled down from $\Delta ABC$ by a factor of $\dfrac{5-4}{13}=\dfrac1{13} (a$s we can see from comparing the two hypotenuses), while $\Delta NBK$ is scaled by a factor of $\dfrac{12-4}{13}=\dfrac8{13}.$ The area we desire is the combined area of $\Delta AMJ$ and $\Delta NBK$ subtracted from the area of $\Delta ABC,$ which is


$$30-30\left(\dfrac1{13}\right)^2-30\left(\dfrac8{13}\right)^2=30\left(1-\left(\dfrac1{13}\right)^2-\left(\dfrac8{13}\right)^2\right)=30\left(1-\dfrac{65}{169}\right)=30\left(\dfrac8{13}\right)=\boxed{\textbf{(D) }\dfrac{240}{13}}.$$


*~Technodoggo*
### Solution 2
Split the pentagon along a different diagonal as follows:


> [Asymptote diagram - not rendered in Markdown]

```asy
unitsize(0.5cm); defaultpen(0.8); pair C=(0,0), A=(0,5), B=(12,0), M=(0,4), N=(4,0); pair J=intersectionpoint(A--B, M--(M+rotate(90)*(B-A)) ); pair K=intersectionpoint(A--B, N--(N+rotate(90)*(B-A)) ); pair L=intersectionpoint(A--B, C--(C+rotate(90)*(B-A)) ); draw( A--B--C--cycle ); draw( M--J ); draw( N--K ); draw( M--N, dashed ); label("$A$",A,NW); label("$B$",B,SE); label("$C$",C,SW); label("$M$",M,SW); label("$N$",N,S); label("$J$",J,NE); label("$K$",K,NE); label("$L$",L,NE);
```

The area of the pentagon is then the sum of the areas of the resulting right triangle and trapezoid. As before, triangles ABC, AMJ, and NBK are all similar.

Since BN=$12-4=8, NK=\frac{5}{13}(8)=\frac{40}{13}$ and BK=$\frac{12}{13}(8)=\frac{96}{13}.$ Since AM=$5-4=$1, JM=$\frac{12}{13}$ and AJ=$\frac{5}{13}.$

The trapezoid's height is therefore $13-\frac{5}{13}-\frac{96}{13}=\frac{68}{13},$ and its area is $\frac{1}{2}\left(\frac{68}{13}\right)\left(\frac{12}{13}+\frac{40}{13}\right)=\frac{34}{13}(4)=\frac{136}{13}.$

Triangle MCN has area $\frac{1}{2}(4)(4)=8,$ and the total area is $\frac{104+136}{13}=\boxed{\frac{240}{13}}.$
### Solution 3
Right triangle ABC has area 1/2 $\cdot AC \cdot BC = 1/2 \cdot 5 \cdot 12 = 30.$

We are given that AC = 5 and CM = 4, so AM = AC - CM = 1. Right triangles AMJ and ABC are similar, with hypotenuses 1 and 13, respectively, so triangle AMJ has area
$$\left( \frac{1}{13} \right)^2 \cdot 30.$$
Also, we are given that BC = 12 and CN = 4, so BN = BC - CN = 8. Right triangles NBK and ABC are similar, with hypotenuses 8 and 13, respectively, so triangle NBK has area
$$\left( \frac{8}{13} \right)^2 \cdot 30.$$
Therefore, the area of pentagon CMJKN is

$$30 - \left( \frac{1}{13} \right)^2 \cdot 30 - \left( \frac{8}{13} \right)^2 \cdot 30 = \boxed{\frac{240}{13}}.$$


*~math31415926535*
### Solution 4
Because triangle ABC, triangle NBK, and triangle AMJ are similar right triangles whose hypotenuses are in the ratio 13 : 8 : 1, their areas are in
the ratio 169 : 64 : 1. The area of triangle ABC is 1/2 (12)(5) = 30, so the areas of triangle NBK and triangle AMJ are (64/169) (30) and (1/169)(30), respectively. Thus the area of pentagon CMJKN is (1 −  64/169 - 1/169)(30)= $\boxed{\mathbf{(D)}240/13}$

Credit to http://billingswest.billings.k12.mt.us/math/AMC%201012/AMC%2012%20work%20sheets/2004%20AMC%2012B%20ws-15.pdf for Solution 3.
### Solution 5
We fake-solve. Draw a perpendicular line to side CB that goes through N. Similarly, draw a perpendicular line to side AC that goes through M. Let them intersect at O. It follows that quadrilateral MONC is a square with side 4 and thus area 16. Now, draw a perpendicular from J to MO and let them intersect at Z. There is a obvious pair of congruent triangles. Fill in the gap. Hence, we see that the area of the pentagon is definitely greater than 16. How much greater? Well, if we let the intersection of AB and NO be X, we can approximate that $\triangle NXK$ has an area greater than 2. So we place bets on $\boxed{\mathbf{(D)}240/13}$  which is correct!

This would be much easier to show and more convincing with a diagram but idk how to upload GeoGebra to AoPSwiki.

Solution by franzliszt
## See Also
