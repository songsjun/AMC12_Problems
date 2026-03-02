# 2017 AMC 12B Problem 13

## Problem
In the figure below, 3 of the 6 disks are to be painted blue, 2 are to be painted red, and 1 is to be painted green. Two paintings that can be obtained from one another by a rotation or a reflection of the entire figure are considered the same. How many different paintings are possible?


> [Asymptote diagram - not rendered in Markdown]

```asy
size(100); pair A, B, C, D, E, F; A = (0,0); B = (1,0); C = (2,0); D = rotate(60, A)*B; E = B + D; F = rotate(60, A)*C; draw(Circle(A, 0.5)); draw(Circle(B, 0.5)); draw(Circle(C, 0.5)); draw(Circle(D, 0.5)); draw(Circle(E, 0.5)); draw(Circle(F, 0.5));
```


$\textbf{(A) } 6 \qquad \textbf{(B) } 8 \qquad \textbf{(C) } 9 \qquad \textbf{(D) } 12 \qquad \textbf{(E) } 15$
## Solution 1
Looking at the answer choices, we see that the possibilities are indeed countable. Thus, we will utilize that approach in the form of two separate cases, as rotation and reflection take care of numerous possibilities. First, consider the case that the green disk is in a corner. No need to explain, but this yields 6 possible arrangements for the 3 blue disks and 2 red disks in the remaining available slots. Now, consider the case that the green disk is on an edge. Again, no need to explain but this also yields 6 more possible arrangements for the 3 blue disks and 2 red disks in the remaining available slots. Thus, our answer is 6 + 6 = $\boxed{\bold{(D)}\, 12}$

Solution by akaashp11
## Solution 2 (Burnside's Lemma)
Burnside's Lemma can be applied to the problem. Number the disks 1-6 from top to bottom and left to right. First, we count the number of group actions. There are 6 in total: 3 rotations, 0°, 120°, and 240°. Additionally, there are 3 different reflections, which are over lines passing through the middle of disks 1, 4, and 6. The 0° rotation has the total number of diagrams fixed, which is 6!/3!$\cdot2$!=60. The 120° and 240° rotations each have 0 fixed diagrams, as one would need the same color for disks
1, 4, 6 and the same color for disks 2, 3, 5, which isn't possible. Consider the reflection over the line passing through disk 1.
The green can be placed in 2 places, disk 1 or 5, and then, the blue must go in either disks 2 and 3 or disks 4 and 6, so the number of fixed diagrams is $2\cdot2=4.$ The other two reflections also have 4 unique fixed diagrams. Therefore, applying Burnside's Lemma, we get (60+4+4+4)/6 = $\boxed{\bold{(D)}\, 12}$

Solution by Aadileo
## Video Solution
https://youtu.be/T7eNQISBzsc?si=eOKSzNorVrHaV1px ~TheBeautyOfMath

*~aashrithm*
## See Also
